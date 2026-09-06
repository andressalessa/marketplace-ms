# NestJS

## Generate files (terminal)

### Generate Middleware
```
nest g mi middleware/logging
```

### Generate Module
```
nest g mo middleware
```

### Generate Service
 The --flat tag generates the file without another auth folder. (auth >> service >> auth.service.ts)
 Without the --flat flag, it would create auth >> service >> auth >> auth.service.ts
```
nest g s auth/service/auth --flat 
```
