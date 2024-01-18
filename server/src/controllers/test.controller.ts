import { Controller, Post, Req } from '@nestjs/common';

import { AppService } from '../app.service';
import { PARAM_LOGGING_LEVEL } from '../parameters';
import { LogMe } from '../serverLibrary';

@Controller('test')
export class TestController {
    constructor(private readonly appService: AppService) {}


    @Post('/doNothing')
    async doNothing(@Req() req) {

        if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Controller: test/doNothing');  }

        return {notice: 'I did nothing'};

    }
  

}
