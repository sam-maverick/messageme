import { Controller, Post, Req } from '@nestjs/common';

import { AppService } from '../app.service';
<<<<<<< HEAD
=======
import { PARAM_LOGGING_LEVEL } from '../parameters';
>>>>>>> f2d05ec (Initial commit)
import { LogMe } from '../serverLibrary';

@Controller('test')
export class TestController {
    constructor(private readonly appService: AppService) {}


    @Post('/doNothing')
    async doNothing(@Req() req) {

<<<<<<< HEAD
        LogMe(1, 'Controller: test/doNothing');
=======
        if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Controller: test/doNothing');  }
>>>>>>> f2d05ec (Initial commit)

        return {notice: 'I did nothing'};

    }
  

}
