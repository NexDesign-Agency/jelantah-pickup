"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, RefreshCw, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function IntegrationsPage() {
  const [isTestingSheets, setIsTestingSheets] = useState(false);
  const [sheetsTestResult, setSheetsTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  const handleTestSheetsConnection = async () => {
    setIsTestingSheets(true);
    setSheetsTestResult(null);

    try {
      const response = await fetch("/api/integrations/sheets/test");
      const result = await response.json();
      setSheetsTestResult(result);
    } catch (error) {
      setSheetsTestResult({
        success: false,
        message: "Failed to test connection",
      });
    } finally {
      setIsTestingSheets(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      setEmailTestResult({
        success: false,
        message: "Please enter an email address",
      });
      return;
    }

    setIsTestingEmail(true);
    setEmailTestResult(null);

    try {
      const response = await fetch("/api/integrations/email/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: testEmailAddress }),
      });

      const result = await response.json();
      setEmailTestResult(result);

      if (result.success) {
        setIsEmailDialogOpen(false);
        setTestEmailAddress("");
      }
    } catch (error) {
      setEmailTestResult({
        success: false,
        message: "Failed to send test email",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations Settings</h1>
        <p className="text-muted-foreground">
          Configure and manage third-party integrations
        </p>
      </div>

      {/* Email Service */}
      <Card>
        <CardHeader>
          <CardTitle>Email Service (Nodemailer)</CardTitle>
          <CardDescription>
            Configure SMTP settings in environment variables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Environment Variables Required:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>SMTP_HOST (e.g., smtp.gmail.com)</li>
              <li>SMTP_PORT (e.g., 587)</li>
              <li>SMTP_USER (your email)</li>
              <li>SMTP_PASS (your app password)</li>
              <li>SMTP_FROM (sender name and email)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>Emails are automatically sent for:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Order created → Customer</li>
              <li>Courier assigned → Customer + Courier</li>
              <li>Pickup completed → Customer + Courier</li>
              <li>Billing created → Customer + Courier + Affiliate</li>
              <li>Payment received → Customer + Courier + Affiliate</li>
            </ul>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Test Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Test Email</DialogTitle>
                  <DialogDescription>
                    Enter an email address to receive a test email. This will verify your SMTP configuration.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-email">Email Address</Label>
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="test@example.com"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                    />
                  </div>

                  {emailTestResult && (
                    <Alert
                      className={
                        emailTestResult.success
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }
                    >
                      <div className="flex items-center gap-2">
                        {emailTestResult.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription
                          className={
                            emailTestResult.success
                              ? "text-green-800"
                              : "text-red-800"
                          }
                        >
                          {emailTestResult.message}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEmailDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleTestEmail} disabled={isTestingEmail}>
                    {isTestingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Test Email"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {emailTestResult && !isEmailDialogOpen && (
              <Alert
                className={
                  emailTestResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }
              >
                <div className="flex items-center gap-2">
                  {emailTestResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription
                    className={
                      emailTestResult.success
                        ? "text-green-800"
                        : "text-red-800"
                    }
                  >
                    {emailTestResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Google Sheets */}
      <Card>
        <CardHeader>
          <CardTitle>Google Sheets Integration</CardTitle>
          <CardDescription>
            Automatically sync paid orders to Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Environment Variables Required:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>GOOGLE_SERVICE_ACCOUNT_EMAIL</li>
              <li>GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</li>
              <li>GOOGLE_SHEET_ID</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>Sheet Columns:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>A: Order Number</li>
              <li>B: Date</li>
              <li>C: Customer Name</li>
              <li>D: Customer Phone</li>
              <li>E: Courier Name</li>
              <li>F: Liters</li>
              <li>G: Price/Liter</li>
              <li>H: Total Amount</li>
            </ul>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              onClick={handleTestSheetsConnection}
              disabled={isTestingSheets}
              variant="outline"
            >
              {isTestingSheets ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>

            {sheetsTestResult && (
              <Alert
                className={
                  sheetsTestResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }
              >
                <div className="flex items-center gap-2">
                  {sheetsTestResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription
                    className={
                      sheetsTestResult.success
                        ? "text-green-800"
                        : "text-red-800"
                    }
                  >
                    {sheetsTestResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            <strong>Auto-sync:</strong> Orders are automatically synced to Google
            Sheets when billing is marked as paid.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

