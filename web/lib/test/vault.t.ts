import { getVault } from "../coin_info";
import { getLocalSigner } from "../sui/local_key";
import { suiClient } from "@/contracts";
let addr = process.env.VAULT || "";
getVault(suiClient, addr).then((v)=>{
    console.log(v);
});