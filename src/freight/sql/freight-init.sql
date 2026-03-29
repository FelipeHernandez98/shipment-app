-- Create freight table
CREATE TABLE IF NOT EXISTS shipmentschema.freight (
  id uuid PRIMARY KEY,
  guide_code varchar(120) NOT NULL UNIQUE,
  origin_city varchar(80) NOT NULL,
  destination_city varchar(80) NOT NULL,
  location_id smallint NOT NULL DEFAULT 0,
  total_packages integer NOT NULL DEFAULT 0,
  created_by_user_id uuid NOT NULL,
  consolidated_pdf_path varchar NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NULL
);

ALTER TABLE shipmentschema.freight
  ADD COLUMN IF NOT EXISTS location_id smallint NOT NULL DEFAULT 0;

-- Add freight reference into shipment table
ALTER TABLE shipmentschema.shipment
  ADD COLUMN IF NOT EXISTS freight_id uuid NULL;

-- Add foreign key only if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_shipment_freight_id'
  ) THEN
    ALTER TABLE shipmentschema.shipment
      ADD CONSTRAINT fk_shipment_freight_id
      FOREIGN KEY (freight_id)
      REFERENCES shipmentschema.freight(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- Indexes for common access patterns
CREATE INDEX IF NOT EXISTS idx_shipment_freight_id
  ON shipmentschema.shipment(freight_id);

CREATE INDEX IF NOT EXISTS idx_freight_created_at
  ON shipmentschema.freight(created_at DESC);

-- Independent daily sequence for freight guide code generation (FT-DDMMYYYYNNNNNNN)
CREATE TABLE IF NOT EXISTS shipmentschema.freight_tracking_sequence (
  sequence_date date PRIMARY KEY,
  current_sequence bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
