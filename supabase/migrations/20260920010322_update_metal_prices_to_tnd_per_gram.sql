/*
# Update gold and silver spot prices to Tunisian Dinar (TND) per gram

1. Modified Tables
- `metal_stock`
  - `spot_price` updated from USD per troy ounce to TND per gram,
    matching the Tunisian local market convention.
  - Gold: 234.55 TND/g  (≈ 2345.67 USD/oz × 3.11 TND/USD ÷ 31.1035 g/oz)
  - Silver: 2.99 TND/g   (≈ 29.88 USD/oz × 3.11 TND/USD ÷ 31.1035 g/oz)
  - `updated_at` refreshed to now.
2. Security
- No RLS or policy changes — existing shared CRUD policies remain in effect.
3. Important Notes
- The valuation formula (weight_kg × 1000 × spot_price) is correct when
  spot_price is expressed per gram, which it now is.
- No data is lost; existing rows are updated in place.
*/

UPDATE metal_stock
SET spot_price = CASE metal
    WHEN 'gold' THEN 234.55
    WHEN 'silver' THEN 2.99
  END,
    updated_at = now()
WHERE metal IN ('gold', 'silver');
