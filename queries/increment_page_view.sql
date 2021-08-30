-- Function to increment the page view count for a given page
CREATE OR REPLACE FUNCTION increment_page_view(page_slug TEXT)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    views INT;
BEGIN
    IF EXISTS (SELECT FROM page_details WHERE slug=page_slug) THEN
        UPDATE page_details
        SET view_count = view_count + 1,
            updated_at = now()
        WHERE slug = page_slug
        RETURNING view_count
        INTO views;
    ELSE
        INSERT into page_details(slug) VALUES (page_slug) RETURNING view_count INTO views;
    END IF;
    RETURN views;
END;
$$;
