import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'online',
      message: 'AgroVision AI Production API is fully operational',
      version: '4.0.0',
      nodes: ['Primary Diagnostic Node: ACTIVE', 'Neural Interface: SYNCED'],
      timestamp: new Date().toISOString()
    };
  }
}
