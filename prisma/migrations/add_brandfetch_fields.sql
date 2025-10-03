-- Add Brandfetch-related fields to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS normalized_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS domain VARCHAR(255),
ADD COLUMN IF NOT EXISTS brandfetch_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS logo_format VARCHAR(50),
ADD COLUMN IF NOT EXISTS logo_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS aliases TEXT[] DEFAULT '{}';

-- Create index for normalized_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_normalized_name ON companies(normalized_name);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);

-- Add Brandfetch-related fields to institutions table
ALTER TABLE institutions
ADD COLUMN IF NOT EXISTS normalized_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS domain VARCHAR(255),
ADD COLUMN IF NOT EXISTS brandfetch_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS logo_format VARCHAR(50),
ADD COLUMN IF NOT EXISTS logo_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS aliases TEXT[] DEFAULT '{}';

-- Create index for normalized_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_institutions_normalized_name ON institutions(normalized_name);
CREATE INDEX IF NOT EXISTS idx_institutions_domain ON institutions(domain);

-- Update existing companies with normalized names
UPDATE companies
SET normalized_name = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(name, '\s+(inc|llc|ltd|corp|corporation|company|co|gmbh|sa|plc)\.?$', '', 'i'),
            '[.,\/#!$%\^&\*;:{}=\-_`~()]', '', 'g'
          ),
          '\s+', ' ', 'g'
        ),
        '^\s+|\s+$', '', 'g'
      ),
      '\s+', ' ', 'g'
    ),
    '^\s+|\s+$', '', 'g'
  )
)
WHERE normalized_name IS NULL;

-- Update existing institutions with normalized names
UPDATE institutions
SET normalized_name = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(name, '\s+(university|college|institute|school|academy)\.?$', '', 'i'),
            '[.,\/#!$%\^&\*;:{}=\-_`~()]', '', 'g'
          ),
          '\s+', ' ', 'g'
        ),
        '^\s+|\s+$', '', 'g'
      ),
      '\s+', ' ', 'g'
    ),
    '^\s+|\s+$', '', 'g'
  )
)
WHERE normalized_name IS NULL;