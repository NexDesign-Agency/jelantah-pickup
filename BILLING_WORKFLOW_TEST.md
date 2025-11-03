# Billing Workflow Test Analysis & Guide

## Complete Workflow Steps

### 1. Create Order (Admin)
- **Location**: `/admin/quick-pickup`
- **Action**: Create order for customer
- **Expected Result**: Order created with status PENDING or ASSIGNED

### 2. Warehouse Verify (Warehouse Staff)
- **Location**: `/warehouse`
- **Action**: Click "Verify" on assigned order
- **Input**: Enter actual liters (e.g., 150)
- **API**: `PATCH /api/orders/[id]/verify`
- **Expected Result**: 
  - Order status → COMPLETED
  - `actualLiters` set to entered value
  - `completedDate` set to current date
  - Notifications sent to customer and courier

### 3. Generate Billing (Admin)
- **Location**: `/admin/billing`
- **Action**: Click "Generate Billing" → Select order → Enter liters
- **API**: `POST /api/billing/generate`
- **Expected Calculations** (for 150 liters):
  
  **Pricing Tier Lookup:**
  - 150 liters falls in range: 100-200 liters
  - Price per liter: **Rp 7,000** ✅

  **Amount Calculations:**
  - `customerAmount` = 150 × 7,000 = **Rp 1,050,000** ✅
  - `courierFee` = 150 × 1,000 = **Rp 150,000** ✅
  - `affiliateFee` = 150 × 200 = **Rp 30,000** (if customer has referrer) ✅
  - `affiliateFee` = **Rp 0** (if customer has no referrer) ✅

- **Expected Result**:
  - Billing record created with billNumber (BILL-YYYYMMDD-XXXX)
  - Order amounts updated (`customerAmount`, `courierFee`, `affiliateFee`)
  - Order `actualLiters` updated
  - Notifications sent (customer, courier, affiliate if exists)

### 4. Upload Payment Proof & Mark as Paid (Admin)
- **Location**: `/admin/billing` → Click billing → "View Details"
- **Action**: 
  - Enter payment proof URL (optional)
  - Click "Mark as Paid"
- **API**: `PATCH /api/billing/[id]/pay`
- **Expected Result**:
  - Billing status → PAID
  - `paymentProofUrl` saved
  - `paidAt` timestamp set
  - Notifications sent to customer and courier

## Calculation Verification

### Test Case 1: 150 Liters (With Referrer)
```
Input: 150 liters
Pricing Tier: 100-200 liters → Rp 7,000/L

Calculations:
✅ customerAmount = 150 × 7,000 = Rp 1,050,000
✅ courierFee = 150 × 1,000 = Rp 150,000
✅ affiliateFee = 150 × 200 = Rp 30,000 (if has referrer)

Total Customer Pays: Rp 1,050,000
```

### Test Case 2: 75 Liters (No Referrer)
```
Input: 75 liters
Pricing Tier: 1-99 liters → Rp 6,500/L

Calculations:
✅ customerAmount = 75 × 6,500 = Rp 487,500
✅ courierFee = 75 × 1,000 = Rp 75,000
✅ affiliateFee = 0 (no referrer)

Total Customer Pays: Rp 487,500
```

### Test Case 3: 250 Liters (With Referrer)
```
Input: 250 liters
Pricing Tier: 201+ liters → Rp 7,500/L

Calculations:
✅ customerAmount = 250 × 7,500 = Rp 1,875,000
✅ courierFee = 250 × 1,000 = Rp 250,000
✅ affiliateFee = 250 × 200 = Rp 50,000 (if has referrer)

Total Customer Pays: Rp 1,875,000
```

## API Endpoints Used

1. `POST /api/orders` - Create order
2. `PATCH /api/orders/[id]/assign` - Assign courier (optional)
3. `PATCH /api/orders/[id]/verify` - Warehouse verify order
4. `GET /api/orders/completed-unbilled` - Get orders ready for billing
5. `POST /api/billing/generate` - Generate billing
6. `GET /api/billing` - List billings
7. `PATCH /api/billing/[id]/pay` - Mark as paid

## Key Functions

### `getPricePerLiter(liters: number)`
- Queries active pricing tiers
- Finds matching tier based on liter range
- Returns price per liter

### `generateBilling(orderId: string, actualLiters: number)`
- Validates order is COMPLETED
- Gets pricing tier for liters
- Calculates all amounts
- Creates billing record
- Updates order with amounts
- Creates notifications

## Potential Issues & Fixes

### ✅ Fixed Issues:
1. **Warehouse Verification**: Created `/api/orders/[id]/verify` endpoint
2. **Order Selection**: Created `/api/orders/completed-unbilled` endpoint
3. **Generate Billing UI**: Integrated SelectOrderDialog and GenerateBillingDialog
4. **Status Filtering**: Updated orders API to support comma-separated statuses

### ⚠️ Notes:
1. Order status remains COMPLETED (not changed to BILLED) - billing status tracks payment separately
2. `generateBilling` uses the `actualLiters` from the order if it exists, but can override with new value
3. Affiliate fee only calculated if customer has `referredBy` relationship

## Testing Checklist

- [ ] 1. Create order via Quick Pickup
- [ ] 2. Login as warehouse staff
- [ ] 3. Verify order with actual liters
- [ ] 4. Login as admin
- [ ] 5. Generate billing for completed order
- [ ] 6. Verify calculations match expected values
- [ ] 7. View billing details
- [ ] 8. Upload payment proof URL
- [ ] 9. Mark billing as paid
- [ ] 10. Verify notifications sent
- [ ] 11. Check billing status updated to PAID

