"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChatBox } from "@/components/chat/ChatBox";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function CourierChatPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (status === "loading" || isLoading || !session?.user) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat with Customer</h1>
        <p className="text-muted-foreground mt-2">
          Order: {order?.orderNumber || orderId}
        </p>
      </div>

      <ChatBox orderId={orderId} userId={session.user.id} />
    </div>
  );
}

