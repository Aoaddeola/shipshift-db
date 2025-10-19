import {
  All,
  Controller,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';

@Controller('tx')
export class ForwardController {
  private readonly targetBaseUrl = 'http://localhost:8224'; // destination base URL

  @All('*')
  async forward(@Req() req: Request, @Res() res: Response) {
    try {
      // Remove "/tx" from the incoming path
      const targetUrl = `${this.targetBaseUrl}${req.originalUrl.replace(/^\/tx/, '')}`;

      // Forward the request
      const response = await axios.request({
        method: req.method,
        url: targetUrl,
        headers: { ...req.headers, host: undefined }, // remove 'host' header
        data: req.body,
        params: req.query,
        validateStatus: () => true, // forward even error responses
      });

      // Return the response as-is
      res.status(response.status).set(response.headers).send(response.data);
    } catch (error) {
      console.error('Error forwarding request:', error.message);
      throw new HttpException(
        'Error forwarding request',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
