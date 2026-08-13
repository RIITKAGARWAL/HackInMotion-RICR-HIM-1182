const db = require('../config/db');

const defaultCategories = [
  // Expense Categories
  { name: 'Food & Dining', type: 'expense', icon_name: 'Utensils', color_code: '#EF4444' },
  { name: 'Rent & Utilities', type: 'expense', icon_name: 'Home', color_code: '#F59E0B' },
  { name: 'Shopping', type: 'expense', icon_name: 'ShoppingBag', color_code: '#EC4899' },
  { name: 'Subscriptions', type: 'expense', icon_name: 'Tv', color_code: '#8B5CF6' },
  { name: 'Travel & Transport', type: 'expense', icon_name: 'Car', color_code: '#3B82F6' },
  { name: 'Entertainment', type: 'expense', icon_name: 'Film', color_code: '#06B6D4' },
  { name: 'Bills & Healthcare', type: 'expense', icon_name: 'Activity', color_code: '#10B981' },
  { name: 'General / Miscellaneous', type: 'expense', icon_name: 'HelpCircle', color_code: '#6B7280' },
  
  // Income Categories
  { name: 'Salary', type: 'income', icon_name: 'Briefcase', color_code: '#22C55E' },
  { name: 'Freelance', type: 'income', icon_name: 'Laptop', color_code: '#10B981' },
  { name: 'Investment Return', type: 'income', icon_name: 'TrendingUp', color_code: '#059669' }
];

async function seedDatabase() {
  try {
    console.log('Starting default category seed...');
    
    for (const category of defaultCategories) {
      const queryText = `
        INSERT INTO categories (name, type, icon_name, color_code)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE 
        SET type = EXCLUDED.type, 
            icon_name = EXCLUDED.icon_name, 
            color_code = EXCLUDED.color_code;
      `;
      await db.query(queryText, [
        category.name,
        category.type,
        category.icon_name,
        category.color_code
      ]);
    }
    
    console.log('✓ Category seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();