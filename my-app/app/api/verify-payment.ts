// import type { NextApiRequest, NextApiResponse } from 'next';
// import axios from 'axios';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { orderId } = req.body;

//   // פנייה ל-API של טרנזיליה לבדוק את הסטטוס
//   const tranzilaResponse = await axios.post('https://api.tranzila.com/get_transaction', {
//     supplier: 'YOUR_TERMINAL_NAME',
//     orderid: orderId,
//     // כאן צריך להוסיף את ה-API Key שקיבלת מטרנזיליה
//   });

//   if (tranzilaResponse.data.Response === '000') {
//     res.status(200).json({ success: true });
//   } else {
//     res.status(400).json({ success: false });
//   }
// }