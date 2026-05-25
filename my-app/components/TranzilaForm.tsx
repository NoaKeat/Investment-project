import React from 'react';

interface TranzilaFormProps {
  amount: number;
  orderId: string;
  successUrl: string; // הכתובת לדף התודה שלך (למשל: https://your-site.com/success)
}

const TranzilaForm = ({ amount, orderId, successUrl }: TranzilaFormProps) => {
  // החליפי את 'YOUR_TERMINAL_NAME' בשם הטרמינל האמיתי שלך
  const TRANZILA_URL = "https://direct.tranzila.com/YOUR_TERMINAL_NAME/iframenew.php";

  return (
    <form action={TRANZILA_URL} method="POST">
      {/* סכום לתשלום */}
      <input type="hidden" name="sum" value={amount} />
      
      {/* מספר הזמנה (חשוב למעקב) */}
      <input type="hidden" name="orderid" value={orderId} />
      
      {/* לאן לחזור בסיום */}
      <input type="hidden" name="success_url_address" value={successUrl} />
      
      {/* מטבע (1 = שקלים) */}
      <input type="hidden" name="currency" value="1" />
      
      {/* כפתור שליחה */}
      <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg">
        עבור לתשלום מאובטח
      </button>
    </form>
  );
};

export default TranzilaForm;