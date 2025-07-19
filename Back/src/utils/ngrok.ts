export async function setupNgrok(port: number): Promise<string | null> {
  try {
    const ngrok = require('ngrok');

    // Configurar o authtoken
    await ngrok.authtoken('303vyKk40lpPLLwC49RSl7DimOn_497U2KV1B4pgVuAsUhJ6h');

    // Conectar ao ngrok
    const url = await ngrok.connect({
      addr: port,
      proto: 'http',
      authtoken: '303vyKk40lpPLLwC49RSl7DimOn_497U2KV1B4pgVuAsUhJ6h'
    });

    console.log(`🚀 Ngrok tunnel opened at: ${url}`);
    console.log(`📊 Ngrok dashboard: http://localhost:4040`);

    return url;
  } catch (error) {
    console.error('❌ Error setting up ngrok:', error);
    return null;
  }
}

export async function disconnectNgrok(): Promise<void> {
  try {
    const ngrok = require('ngrok');
    await ngrok.disconnect();
    console.log('🔌 Ngrok disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting ngrok:', error);
  }
}
