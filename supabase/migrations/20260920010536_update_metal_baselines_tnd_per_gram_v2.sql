/*
# Update gold and silver baselines to realistic Tunisian market TND/gram

1. Modified Tables
- `metal_stock`
  - Gold spot_price set to 412.00 TND/g (24K baseline)
  - Silver spot_price set to 4.50 TND/g (24K baseline)
  - updated_at refreshed to now
2. Security
- No RLS or policy changes
3. Important Notes
- These baselines reflect the Tunisian local market convention of
  pricing precious metals per gram in TND.
- 18K gold price is derived in the frontend as spot * (18/24) = 308.00 TND/g.
- No data is lost; existing rows are updated in place.
*/

UPDATE metal_stock
SET spot_price = CASE metal
    WHEN 'gold' THEN 412.00
    WHEN 'silver' THEN 4.50
  END,
    updated_at = now()
WHERE metal IN ('gold', 'silver');
