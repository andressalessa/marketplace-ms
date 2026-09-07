import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async waitForConnection(maxAttempts = 10, delayMs = 500): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (this.channel) {
        return true;
      }
      this.logger.log(
        `⏳ Waiting for RabbitMQ connection... (attempt ${attempt}/${maxAttempts})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return false;
  }

  private async connect() {
    const rabbitmqUrl = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://admin:admin@localhost:5672',
    );

    try {
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      this.logger.log('✅ Connected to RabbitMQ successfully');

      // Event listener to monitor the connection
      this.connection.on('error', (err) => {
        this.logger.error('❌ RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('⚠️ RabbitMQ connection closed');
      });

      this.connection.on('blocked', (reason) => {
        this.logger.warn('⚠️ RabbitMQ connection blocked:', reason);
      });

      this.connection.on('unblocked', () => {
        this.logger.log('✅ RabbitMQ connection unblocked');
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        '⚠️ Failed to connect to RabbitMQ, cotinuing wihout message queue:',
        errorMessage || error,
      );
    }
  }

  private async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.logger.log('✅ RabbitMQ channel closed');
      }

      if (this.connection) {
        await this.connection.close();
        this.logger.log('✅ Disconnected from RabbitMQ');
      }
    } catch (error) {
      this.logger.error('❌ Error disconnecting from RabbitMQ:', error);
    }
  }

  getChannel(): amqp.Channel {
    return this.channel;
  }

  getConnection(): amqp.ChannelModel {
    return this.connection;
  }

  async publishMessage(
    exchange: string,
    rountingKey: string,
    message: any,
  ): Promise<void> {
    try {
      if (!this.channel) {
        this.logger.warn(
          '⚠️ RabbitMQ channel is not available, skipping message publish',
        );
        return;
      }

      //   topic: allows complex routing with patterns
      // durable: survive any restarts on rabbitmq
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      const messageBuffer = Buffer.from(JSON.stringify(message));

      const published = await this.channel.publish(
        exchange,
        rountingKey,
        messageBuffer,
        {
          persistent: true,
          timestamp: Date.now(),
          contentType: 'application/json',
        },
      );
      if (!published) {
        throw new Error('Failed to publish message to RabbitMQ');
      }

      this.logger.log(`✅ Message published to ${exchange}:${rountingKey}`);
      this.logger.debug(`Message content: ${JSON.stringify(message)}`);
    } catch (error) {
      this.logger.error(`❌ Error publishing message to RabbitMQ:`, error);
    }
  }

  async subscribeToQueue(
    queueName: string,
    exchange: string,
    routingKey: string,
    callback: (message: unknown) => Promise<void> | void,
  ): Promise<void> {
    try {
      if (!this.channel) {
        this.logger.warn('⚠️ RabbitMQ channel is not available.');
        return;
      }

      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      const queue = await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-message-ttl': 86400000,
          'x-max-length': 10000,
        },
      });

      await this.channel.bindQueue(queue.queue, exchange, routingKey);
      await this.channel.prefetch(1);
      await this.channel.consume(queue.queue, async (msg) => {
        if (msg) {
          try {
            const message: unknown = JSON.stringify(msg.content.toString());
            this.logger.log(`📨 Message received from queue: ${queueName}`);
            this.logger.debug(`Message content: ${JSON.stringify(message)}`);
            await callback(message);

            this.channel.ack(msg); // removes msg from channel (accept message)

            this.logger.log(
              `✅ Message processed succesfully from queue: ${queueName}`,
            );
          } catch (error) {
            this.logger.error(`❌ Error processing message:`, error);
            this.channel.nack(msg, false, false); // rejects message (in prod send to DLQ)
          }
        }
      });

      this.logger.log(
        `✅ Subscribed to queue: ${queueName} with routing key: ${routingKey}`,
      );
    } catch (error) {
      this.logger.error(`❌ Error to subscribe to queue: ${queueName}`, error);
    }
  }
}
