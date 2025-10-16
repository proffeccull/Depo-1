import * as Sentry from "@sentry/nestjs";

Sentry.init({
  dsn: "https://4539f86e16c9bf82d08aada40f086eee@o4510196471955456.ingest.de.sentry.io/4510196573667408",
  sendDefaultPii: true,
  _experiments: {
    enableLogs: true,
  },
});