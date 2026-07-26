-- Weekly showcase table header labels and styles (admin-editable).
CREATE TABLE "weekly_showcase_column_headers" (
    "columnKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "headerStyle" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_showcase_column_headers_pkey" PRIMARY KEY ("columnKey")
);
