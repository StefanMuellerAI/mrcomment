CREATE OR REPLACE FUNCTION calculate_available_generations(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_plan RECORD;
    customer_count INTEGER;
    max_generations_per_customer INTEGER;
    available_generations INTEGER;
BEGIN
    -- Hole den Plan des Benutzers
    SELECT p.* INTO user_plan
    FROM plans p
    JOIN user_plans up ON p.id = up.plan_id
    WHERE up.user_id = user_id;

    -- Zähle die Kunden des Benutzers
    SELECT COUNT(*) INTO customer_count
    FROM customers
    WHERE user_id = user_id;

    -- Setze einen Mindestwert von 1 für customer_count, um Division durch Null zu vermeiden
    customer_count := GREATEST(customer_count, 1);
    
    -- Berechne Generierungen pro Kunde
    max_generations_per_customer := user_plan.weekly_generations / user_plan.max_customers;
    
    -- Berechne verfügbare Generierungen basierend auf tatsächlicher Kundenzahl
    available_generations := max_generations_per_customer * LEAST(customer_count, user_plan.max_customers);
    
    -- Stelle sicher, dass niemals mehr als das Gesamtlimit des Plans verwendet werden kann
    available_generations := LEAST(available_generations, user_plan.weekly_generations);
    
    RETURN available_generations;
END;
$$ LANGUAGE plpgsql; 