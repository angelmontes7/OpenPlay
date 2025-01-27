USE ap;

#1.
SELECT invoice_total, ROUND(invoice_total, 1) AS one_digit, ROUND(invoice_total) as zero_digit
FROM invoices;

#2.
USE ex;
SELECT 
	start_date, 
	DATE_FORMAT(start_date, '%b/%d/%y') as format1,
    DATE_FORMAT(start_date, '%c/%e/%y') as format2,
    DATE_FORMAT(start_date, '%h:%i %p') as twelve_hour,
    DATE_FORMAT(start_date, '%c/%e/%y %h:%i %p') as format3
FROM date_sample;

#3.
USE ap;
SELECT 
	vendor_name,
    UPPER(vendor_name),
    vendor_phone,
    RIGHT(vendor_phone, 4),
	REPLACE(REPLACE(REPLACE(REPLACE(vendor_phone, '(', ''), ')', ''), ' ', '.'), '-', '.')
FROM vendors;

#4
USE ap;
SELECT
	invoice_number,
    invoice_date,
    DATE_ADD(invoice_date, INTERVAL 30 DAY) as date_plus_30_days,
    payment_date,
    DATEDIFF(invoice_date, payment_date) as days_to_pay,
    DATE_FORMAT(invoice_date, '%c') as month,
	DATE_FORMAT(invoice_date, '%Y') as year
FROM invoices
WHERE DATE_FORMAT(invoice_date, '%c') = 5
ORDER BY invoice_date DESC;



    
