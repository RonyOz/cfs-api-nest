// Suppress NestJS logs during testing

// Suppress console.error for specific NestJS warnings
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

console.error = (...args: any[]) => {
    // Convert args to string to check content
    const message = args.join(' ');

    // Suppress AuthGuard warnings
    if (message.includes('In order to use "defaultStrategy"')) {
        return;
    }

    // Suppress other NestJS warnings if needed
    if (message.includes('[AuthGuard]')) {
        return;
    }

    originalConsoleError.apply(console, args);
};

console.log = (...args: any[]) => {
    const message = args.join(' ');

    // Suppress NestJS initialization logs during tests
    if (message.includes('Nest') || message.includes('ERROR')) {
        return;
    }

    originalConsoleLog.apply(console, args);
};
