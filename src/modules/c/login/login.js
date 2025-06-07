import { LightningElement, track } from 'lwc';
import { salesforceService } from 'c/salesforceService';

export default class Login extends LightningElement {
    @track username = '';
    @track password = '';
    @track errorMessage = '';
    @track isLoading = false;
    @track isLoggedIn = false;
    @track proxyError = false;

    // Salesforce instance URL - you might want to make this configurable
    loginUrl = 'https://login.salesforce.com';

    connectedCallback() {
        // Check if already logged in
        this.isLoggedIn = salesforceService.isLoggedIn();

        // Check if proxy server is running
        // this.checkProxyServer();
    }

    // Check if the proxy server is running
    async checkProxyServer() {
        try {
            const response = await fetch(
                'http://localhost:3001/api/auth/login',
                {
                    method: 'HEAD'
                }
            ).catch(() => null);

            this.proxyError = !response || !response.ok;

            if (this.proxyError) {
                this.errorMessage =
                    'Proxy server is not running. Please start the proxy server with "npm run proxy-server"';
            }
        } catch (error) {
            this.proxyError = true;
            this.errorMessage =
                'Proxy server is not running. Please start the proxy server with "npm run proxy-server"';
        }
    }

    handleUsernameChange(event) {
        this.username = event.target.value;
        if (this.errorMessage && !this.proxyError) {
            this.errorMessage = ''; // Clear any previous errors only if not proxy error
        }
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
        if (this.errorMessage && !this.proxyError) {
            this.errorMessage = ''; // Clear any previous errors only if not proxy error
        }
    }

    async handleLogin() {
        // Check if proxy server is running
        if (this.proxyError) {
            this.errorMessage =
                'Proxy server is not running. Please start the proxy server with "npm run proxy-server"';
            return;
        }

        if (!this.username || !this.password) {
            this.errorMessage = 'Please enter both username and password';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        try {
            // Use our service to login
            const data = {
                username: this.username,
                password: this.password,
                loginUrl: this.loginUrl
            };
            console.log('data', data);

            const userInfo = await fetch(
                'http://localhost:3001/api/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );
            // const userInfo = await salesforceService.login(
            //     data
            // );
            const response = await userInfo.json();
            console.log('userInfo', response);
            this.isLoggedIn = true;

            if (userInfo.ok) {
                sessionStorage.setItem('sf_access_token', response.accessToken);
                sessionStorage.setItem('sf_instance_url', response.instanceUrl);
                sessionStorage.setItem('sf_user_id', response.userId);

                // Dispatch a success event
                this.dispatchEvent(
                    new CustomEvent('login', {
                        detail: {
                            userId: response.id,
                            orgId: response.organizationId,
                            success: true
                        }
                    })
                );
            }
        } catch (error) {
            console.error('Login error:', error);

            // Show an appropriate error message
            if (error.message.includes('Authentication failed')) {
                this.errorMessage =
                    'Invalid username or password. Please try again.';
            } else if (error.message.includes('fetch')) {
                this.errorMessage =
                    'Connection error. Please check that the proxy server is running.';
                this.proxyError = true;
            } else {
                this.errorMessage =
                    error.message || 'Login failed. Please try again.';
            }
        } finally {
            this.isLoading = false;
        }
    }

    // Handle proxy server reconnection attempt
    async handleRetryConnection() {
        this.isLoading = true;
        this.errorMessage = 'Checking proxy server connection...';
        // await this.checkProxyServer();
        this.isLoading = false;
    }

    // Cleanup method
    disconnectedCallback() {
        // Clear sensitive data
        this.username = '';
        this.password = '';
    }
}
