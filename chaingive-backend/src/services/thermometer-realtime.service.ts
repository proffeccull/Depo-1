import websocketService from './websocket.service';
import fundraisingService from './fundraising.service';

class ThermometerRealtimeService {
  async broadcastUpdate(categoryId: string) {
    const data = await fundraisingService.getThermometerData(categoryId);
    websocketService.broadcast('thermometer:update', { categoryId, ...data });
  }
}

export default new ThermometerRealtimeService();
