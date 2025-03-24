import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AccountBalance } from "@/lib/coin_owner";
import { useEffect } from "react";
import { useState } from "react";


export function OwnerTable(props : { coin_type : string}) {
    const [balances,setBalances] = useState<AccountBalance[]>([]);
    const [errMsg,setErrMsg] = useState<string>  ("");
    useEffect(()=>{
        fetch('/api/coin_owner',{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({coin_type:props.coin_type})
        }).then((rsp) =>{
            if(rsp.status == 200 ){
                rsp.json().then((value) => setBalances(value.data))
            } else{
                setErrMsg(rsp.statusText)
            }
        })

    });//end useEffect
  return (
    <Table>
      <TableCaption>Top 20 owners </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableHead>SUI</TableHead>
          <TableHead className="text-right">Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {balances.map((ab) => (
          <TableRow key={ab.account}>
            <TableCell className="font-medium">{ab.account}</TableCell>
            <TableCell>{Number(ab.balance)}</TableCell>
            <TableCell className="text-right">{ab.percentage}</TableCell>
          </TableRow>
        ))}
      </TableBody>

    </Table>
  )
}