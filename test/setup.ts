// Suppress noisy NestJS logs during testing (AuthGuard / Passport defaultStrategy)
// We override console and process streams to filter messages no matter how Nest prints them.

const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalStderrWrite = process.stderr.write.bind(process.stderr);
const originalStdoutWrite = process.stdout.write.bind(process.stdout);

function isSuppressedMessage(message: string) {
    if (!message) return false;
    return (
        message.includes('In order to use "defaultStrategy"') || // passport defaultStrategy warning
        message.includes('[AuthGuard]') || // AuthGuard tag
        // some Nest messages start with [Nest] ... ERROR [AuthGuard] ... so check both
        message.includes('ERROR [AuthGuard]')
    );
}

console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (isSuppressedMessage(message)) return;
    originalConsoleError.apply(console, args);
};

console.log = (...args: any[]) => {
    const message = args.join(' ');
    // Keep general logs but suppress noisy Nest init / error lines if they match
    if (isSuppressedMessage(message)) return;
    originalConsoleLog.apply(console, args);
};

// Also intercept low-level stream writes which sometimes bypass console wrappers
process.stderr.write = (chunk: any, encoding?: any, cb?: any) => {
    try {
        const str = typeof chunk === 'string' ? chunk : chunk.toString();
        if (isSuppressedMessage(str)) return true;
    } catch (e) {
        // ignore
    }
    return originalStderrWrite(chunk, encoding, cb);
};

process.stdout.write = (chunk: any, encoding?: any, cb?: any) => {
    try {
        const str = typeof chunk === 'string' ? chunk : chunk.toString();
        if (isSuppressedMessage(str)) return true;
    } catch (e) {
        // ignore
    }
    return originalStdoutWrite(chunk, encoding, cb);
};
