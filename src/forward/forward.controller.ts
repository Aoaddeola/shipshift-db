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
  private readonly targetBaseUrl = 'http://localhost:8223'; // ensure correct protocol!

  @All('*')
  async forward(@Req() req: Request, @Res() res: Response) {
    try {
      const targetUrl = `${this.targetBaseUrl}${req.originalUrl.replace(/^\/tx/, '')}`;

      const { host, 'content-length': _cl, connection, ...headers } = req.headers;

      const response = await axios.request({
        method: req.method,
        url: targetUrl,
        headers,
        data: req.body ?? undefined,
        params: req.query,
        timeout: 15000, // 15s timeout for safety
        validateStatus: () => true,
      });

      res.status(response.status).set(response.headers).send(response.data);
    } catch (error) {
      console.error('Error forwarding request:', error.message);

      if (error.code === 'ECONNREFUSED') {
        throw new HttpException('Target server refused the connection', HttpStatus.BAD_GATEWAY);
      } else if (error.code === 'ECONNRESET') {
        throw new HttpException('Connection reset by target server', HttpStatus.BAD_GATEWAY);
      } else {
        throw new HttpException(
          'Error forwarding request',
          HttpStatus.BAD_GATEWAY,
        );
      }
    }
  }
}
