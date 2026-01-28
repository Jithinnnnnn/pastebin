import './globals.css';

export const metadata = {
    title: 'Pastebin ',
    description: 'A simple, fast paste sharing service',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {/* Block MetaMask and other Web3 wallets from injecting + Suppress errors */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                // Block ethereum injection
                                try {
                                    Object.defineProperty(window, 'ethereum', {
                                        get: function() { return undefined; },
                                        set: function() { return true; },
                                        configurable: false,
                                        enumerable: false
                                    });
                                } catch(e) {}
                                
                                // Block web3 injection
                                try {
                                    Object.defineProperty(window, 'web3', {
                                        get: function() { return undefined; },
                                        set: function() { return true; },
                                        configurable: false,
                                        enumerable: false
                                    });
                                } catch(e) {}
                                
                                // Suppress MetaMask errors globally
                                window.addEventListener('error', function(e) {
                                    if (e.message && (
                                        e.message.includes('MetaMask') || 
                                        e.message.includes('ethereum') ||
                                        e.message.includes('web3')
                                    )) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        return true;
                                    }
                                }, true);
                                
                                window.addEventListener('unhandledrejection', function(e) {
                                    if (e.reason && e.reason.message && (
                                        e.reason.message.includes('MetaMask') ||
                                        e.reason.message.includes('ethereum') ||
                                        e.reason.message.includes('web3')
                                    )) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        return true;
                                    }
                                }, true);
                            })();
                        `
                    }}
                />
            </head>
            <body>
                {/* Animated Background Blobs from the new design */}
                <div className="blob-cont">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                </div>

                {children}
            </body>
        </html>
    );
}