# Professional Expense Tracker

A modern, scalable expense tracking web application built with React and Supabase.

## Features

- **User Authentication**: Secure login/register system
- **Personal Dashboard**: Overview of expense statistics
- **Daily Expense Management**: Add, edit, delete expenses with auto-calculation
- **Real-time Data**: All data synced with Supabase database
- **Responsive Design**: Works on desktop and mobile devices
- **Scalable**: Built for large user bases with Supabase

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Update `src/utils/supabase.js` with your credentials:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_URL'
   const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
   ```

### 3. Database Setup
Run this SQL in your Supabase SQL Editor:

```sql
-- Create expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own expenses
CREATE POLICY "Users can only see their own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);
```

### 4. Run the Application
```bash
npm start
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Dashboard**: View your expense statistics and overview
3. **Daily Expenses**: 
   - Click "Add Expense" to create new expenses
   - Edit expenses by clicking the edit icon
   - Delete expenses by clicking the trash icon
   - View auto-calculated totals

## Technology Stack

- **Frontend**: React 18
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: CSS3 with responsive design
- **Icons**: Lucide React

## Database Schema

### expenses table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `title`: VARCHAR(255) - Expense description
- `amount`: DECIMAL(10,2) - Expense amount
- `category`: VARCHAR(100) - Expense category
- `date`: DATE - Expense date
- `created_at`: TIMESTAMP - Record creation time

## Security Features

- Row Level Security (RLS) enabled
- Users can only access their own data
- Secure authentication with Supabase
- Input validation and sanitization

## Scalability

- Built on Supabase for automatic scaling
- Optimized queries for performance
- Efficient state management
- Responsive design for all devices