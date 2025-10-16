type ReportableError = unknown;

const ErrorHandler = {
  toMessage(error: ReportableError): string {
    if (!error) return 'Unknown error';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message || 'Unexpected error';
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unexpected error';
    }
  },
};

export default ErrorHandler;

