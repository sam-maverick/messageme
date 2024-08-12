<<<<<<< HEAD
import { PARAM_LOGGING_LEVEL } from './parameters';

export function LogMe(level, message) {
    if (level <= PARAM_LOGGING_LEVEL) {
        console.log(message);
    }
=======
export function LogMe(message) {
    console.log(message);
>>>>>>> f2d05ec (Initial commit)
}
