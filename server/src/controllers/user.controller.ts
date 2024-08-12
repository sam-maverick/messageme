import { Controller, Post, Req } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';


import { AppService } from '../app.service';
import UsersModel from '../middleware/database/schemas/user';
<<<<<<< HEAD
=======
import { PARAM_LOGGING_LEVEL } from '../parameters';
>>>>>>> f2d05ec (Initial commit)
import { LogMe } from '../serverLibrary';


@Controller('accounts')
export class UserController {
  constructor(private readonly appService: AppService) {}


    @Post('/getAccountsList')
    async getAccountsList(@Req() req) {

<<<<<<< HEAD
        LogMe(1, 'Controller: accounts/getAccountsList');
=======
        if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Controller: accounts/getAccountsList');  }
>>>>>>> f2d05ec (Initial commit)

        const cookie = req.body.cookie;

        const requesteruser = await UsersModel.findOne({'cookie': cookie });
        
        if (requesteruser) {

            const allUsernames = await UsersModel.find({}, { username: 1, _id:0 });
            
            return {
                isSuccessful: true,
                listOfAllUsernames: allUsernames,
            };
        
        } else {
            return {
                isSuccessful: false,
                resultMessage: 'This cookie does not exist.',        
            };
        }

    }



    @Post('/checkAccount')
    async checkAccount(@Req() req) {

<<<<<<< HEAD
        LogMe(1, 'Controller: accounts/checkAccount');
=======
        if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Controller: accounts/checkAccount');  }
>>>>>>> f2d05ec (Initial commit)

        const cookie: string = req.body.cookie;

        const userAlreadyExists = await UsersModel.findOne({'cookie': cookie });

        if(userAlreadyExists) {

            return {
                isSuccessful: true,
            };

        } else {

            return {
                isSuccessful: false,
                resultMessage: 'Cookie not found on the server.',     
            };
        }

    }



    @Post('/createAccount')
    async createAccount(@Req() req) {

<<<<<<< HEAD
        LogMe(1, 'Controller: accounts/createAccount');
=======
        if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Controller: accounts/createAccount');  }
>>>>>>> f2d05ec (Initial commit)
    
        const username: string = req.body.username;

        if (!username.match(/^[0-9a-zA-Z]+$/)) {
            return {
                isSuccessful: false,
                resultMessage: 'Only alphanumeric characters are allowed. Please choose another username.',        
            };
        }


        const userAlreadyExists = await UsersModel.findOne({'username': username });

        if(userAlreadyExists) {

            return {
                isSuccessful: false,
                resultMessage: 'This username is already taken. Choose another one.',        
            };

        } else {

            const newUserDocument = {
                cookie: uuidv4(),
                username : username,
            };

            const user = await UsersModel.create(newUserDocument);

            if(user) {
                return {
                    isSuccessful: true,
                    resultMessage: 'User created successfully.',
                    user: newUserDocument,
                };
            } else {
                return {
                    isSuccessful: false,
                    resultMessage: 'There has been an error.',
                };
            }
        }
    }
  
}
