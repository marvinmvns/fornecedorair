export interface IWhatsappProvider {
    sendMessage(to: string, message: string, context?: any): Promise<void>;
    checkHealth(): Promise<boolean>;
}
