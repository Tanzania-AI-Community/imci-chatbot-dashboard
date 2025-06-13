-- Convert existing nodes to question type and update content structure
UPDATE nodes
SET 
  type = 'question',
  content = jsonb_build_object(
    'text',
    CASE 
      WHEN content->>'text' IS NOT NULL THEN content->>'text'
      WHEN content->>'message' IS NOT NULL THEN content->>'message'
      ELSE ''
    END,
    'options',
    CASE
      WHEN content->'options' IS NOT NULL THEN content->'options'
      WHEN content->'buttons' IS NOT NULL THEN 
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'text', btn->>'title',
              'value', btn->>'value',
              'next_node', btn->>'next'
            )
          )
          FROM jsonb_array_elements(content->'buttons') btn
        )
      ELSE '[]'::jsonb
    END
  )
WHERE type <> 'question';
