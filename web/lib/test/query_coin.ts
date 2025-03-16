import {queryCoinVaults} from '../coin_info'
import { suiClient } from '@/contracts';
queryCoinVaults(suiClient).then(console.log);