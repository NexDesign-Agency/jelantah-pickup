import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
            <CardDescription>Total orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
            <CardDescription>Awaiting pickup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Earned</CardTitle>
            <CardDescription>From referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

