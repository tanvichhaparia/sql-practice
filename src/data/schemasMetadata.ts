// Auto-generated metadata for schemas
export interface SchemaColumn { name: string; type: string; isPk?: boolean; }
export interface SchemaTable { tableName: string; columns: SchemaColumn[]; }
export interface SchemaInfo { id: string; title: string; description: string; tables: string[]; tableDetails: SchemaTable[]; }
export const ALL_SCHEMAS: SchemaInfo[] = [
  {
    "id": "HR",
    "title": "HR & Employee Database",
    "description": "Departments, employees, reporting hierarchies, salaries and projects",
    "tables": [
      "departments",
      "employees",
      "projects",
      "emp_projects"
    ],
    "tableDetails": [
      {
        "tableName": "departments",
        "columns": [
          {
            "name": "dept_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "dept_name",
            "type": "VARCHAR(50)",
            "isPk": false
          },
          {
            "name": "location",
            "type": "VARCHAR(50)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "employees",
        "columns": [
          {
            "name": "emp_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "emp_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "email",
            "type": "VARCHAR(100)",
            "isPk": false
          },
          {
            "name": "dept_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "manager_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "job_title",
            "type": "VARCHAR(60)",
            "isPk": false
          },
          {
            "name": "salary",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "commission",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "hire_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "city",
            "type": "VARCHAR(50)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "projects",
        "columns": [
          {
            "name": "project_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "project_name",
            "type": "VARCHAR(60)",
            "isPk": false
          },
          {
            "name": "dept_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "start_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "end_date",
            "type": "DATE",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "emp_projects",
        "columns": [
          {
            "name": "emp_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "project_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "hours",
            "type": "INT",
            "isPk": false
          }
        ]
      }
    ]
  },
  {
    "id": "CAMPUS",
    "title": "Campus & Academic Database",
    "description": "Students, university courses, enrollments and grades",
    "tables": [
      "students",
      "courses",
      "enrollments"
    ],
    "tableDetails": [
      {
        "tableName": "students",
        "columns": [
          {
            "name": "student_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "student_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "dept",
            "type": "VARCHAR(10)",
            "isPk": false
          },
          {
            "name": "admission_year",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "city",
            "type": "VARCHAR(50)",
            "isPk": false
          },
          {
            "name": "age",
            "type": "INT",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "courses",
        "columns": [
          {
            "name": "course_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "course_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "credits",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "dept",
            "type": "VARCHAR(10)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "enrollments",
        "columns": [
          {
            "name": "enroll_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "student_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "course_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "marks",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "semester",
            "type": "INT",
            "isPk": false
          }
        ]
      }
    ]
  },
  {
    "id": "SHOP",
    "title": "E-Commerce Marketplace",
    "description": "Customers, catalog products, orders, order items and reviews (Amazon / Flipkart / Myntra style)",
    "tables": [
      "customers",
      "products",
      "orders",
      "order_items",
      "reviews"
    ],
    "tableDetails": [
      {
        "tableName": "customers",
        "columns": [
          {
            "name": "customer_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "customer_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "email",
            "type": "VARCHAR(100)",
            "isPk": false
          },
          {
            "name": "city",
            "type": "VARCHAR(50)",
            "isPk": false
          },
          {
            "name": "state",
            "type": "VARCHAR(50)",
            "isPk": false
          },
          {
            "name": "signup_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "is_prime",
            "type": "INT",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "products",
        "columns": [
          {
            "name": "product_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "product_name",
            "type": "VARCHAR(100)",
            "isPk": false
          },
          {
            "name": "category",
            "type": "VARCHAR(40)",
            "isPk": false
          },
          {
            "name": "brand",
            "type": "VARCHAR(40)",
            "isPk": false
          },
          {
            "name": "price",
            "type": "DECIMAL(10,2)",
            "isPk": false
          },
          {
            "name": "stock",
            "type": "INT",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "orders",
        "columns": [
          {
            "name": "order_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "customer_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "order_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "status",
            "type": "VARCHAR(20)",
            "isPk": false
          },
          {
            "name": "payment_mode",
            "type": "VARCHAR(20)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "order_items",
        "columns": [
          {
            "name": "order_item_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "order_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "product_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "quantity",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "unit_price",
            "type": "DECIMAL(10,2)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "reviews",
        "columns": [
          {
            "name": "review_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "product_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "customer_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "rating",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "review_date",
            "type": "DATE",
            "isPk": false
          }
        ]
      }
    ]
  },
  {
    "id": "FOOD",
    "title": "Food Delivery Platform",
    "description": "Food users, restaurant listings, delivery partners and orders (Swiggy / Zomato style)",
    "tables": [
      "food_users",
      "restaurants",
      "riders",
      "food_orders"
    ],
    "tableDetails": [
      {
        "tableName": "food_users",
        "columns": [
          {
            "name": "user_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "user_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "city",
            "type": "VARCHAR(50)",
            "isPk": false
          },
          {
            "name": "signup_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "is_pro",
            "type": "INT",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "restaurants",
        "columns": [
          {
            "name": "restaurant_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "restaurant_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "city",
            "type": "VARCHAR(50)",
            "isPk": false
          },
          {
            "name": "cuisine",
            "type": "VARCHAR(40)",
            "isPk": false
          },
          {
            "name": "avg_rating",
            "type": "DECIMAL(3,2)",
            "isPk": false
          },
          {
            "name": "opened_date",
            "type": "DATE",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "riders",
        "columns": [
          {
            "name": "rider_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "rider_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "city",
            "type": "VARCHAR(50)",
            "isPk": false
          },
          {
            "name": "joined_date",
            "type": "DATE",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "food_orders",
        "columns": [
          {
            "name": "order_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "user_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "restaurant_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "rider_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "order_ts",
            "type": "DATETIME",
            "isPk": false
          },
          {
            "name": "order_value",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "discount",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "delivery_minutes",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "status",
            "type": "VARCHAR(20)",
            "isPk": false
          },
          {
            "name": "rating",
            "type": "INT",
            "isPk": false
          }
        ]
      }
    ]
  },
  {
    "id": "BANK",
    "title": "Banking & Core BFSI",
    "description": "Bank customers, KYC status, savings/current accounts, transaction ledgers and loans",
    "tables": [
      "bank_customers",
      "accounts",
      "transactions",
      "loans"
    ],
    "tableDetails": [
      {
        "tableName": "bank_customers",
        "columns": [
          {
            "name": "cust_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "cust_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "city",
            "type": "VARCHAR(50)",
            "isPk": false
          },
          {
            "name": "kyc_status",
            "type": "VARCHAR(20)",
            "isPk": false
          },
          {
            "name": "joined_date",
            "type": "DATE",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "accounts",
        "columns": [
          {
            "name": "account_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "cust_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "account_type",
            "type": "VARCHAR(20)",
            "isPk": false
          },
          {
            "name": "balance",
            "type": "DECIMAL(12,2)",
            "isPk": false
          },
          {
            "name": "opened_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "branch",
            "type": "VARCHAR(40)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "transactions",
        "columns": [
          {
            "name": "txn_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "account_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "txn_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "txn_type",
            "type": "VARCHAR(10)",
            "isPk": false
          },
          {
            "name": "amount",
            "type": "DECIMAL(12,2)",
            "isPk": false
          },
          {
            "name": "channel",
            "type": "VARCHAR(10)",
            "isPk": false
          },
          {
            "name": "status",
            "type": "VARCHAR(10)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "loans",
        "columns": [
          {
            "name": "loan_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "cust_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "principal",
            "type": "DECIMAL(12,2)",
            "isPk": false
          },
          {
            "name": "interest_rate",
            "type": "DECIMAL(4,2)",
            "isPk": false
          },
          {
            "name": "tenure_months",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "disbursed_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "status",
            "type": "VARCHAR(10)",
            "isPk": false
          }
        ]
      }
    ]
  },
  {
    "id": "PAY",
    "title": "UPI & Payment Gateway",
    "description": "Merchants, payment transactions, statuses, fees and timestamps (PhonePe / Razorpay / Paytm style)",
    "tables": [
      "merchants",
      "payments"
    ],
    "tableDetails": [
      {
        "tableName": "merchants",
        "columns": [
          {
            "name": "merchant_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "merchant_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "category",
            "type": "VARCHAR(30)",
            "isPk": false
          },
          {
            "name": "city",
            "type": "VARCHAR(50)",
            "isPk": false
          },
          {
            "name": "onboarded_date",
            "type": "DATE",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "payments",
        "columns": [
          {
            "name": "payment_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "merchant_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "user_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "pay_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "amount",
            "type": "DECIMAL(10,2)",
            "isPk": false
          },
          {
            "name": "method",
            "type": "VARCHAR(15)",
            "isPk": false
          },
          {
            "name": "status",
            "type": "VARCHAR(10)",
            "isPk": false
          }
        ]
      }
    ]
  },
  {
    "id": "FIN",
    "title": "Trading & Financial Markets",
    "description": "Tickers, stock prices, professional traders and buy/sell trade executions (Goldman / JPM / Morgan Stanley style)",
    "tables": [
      "stock_prices",
      "traders",
      "trades"
    ],
    "tableDetails": [
      {
        "tableName": "stock_prices",
        "columns": [
          {
            "name": "symbol",
            "type": "VARCHAR(10)",
            "isPk": false
          },
          {
            "name": "price_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "close_price",
            "type": "DECIMAL(10,2)",
            "isPk": false
          },
          {
            "name": "volume",
            "type": "INT",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "traders",
        "columns": [
          {
            "name": "trader_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "trader_name",
            "type": "VARCHAR(60)",
            "isPk": false
          },
          {
            "name": "desk",
            "type": "VARCHAR(30)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "trades",
        "columns": [
          {
            "name": "trade_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "trader_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "symbol",
            "type": "VARCHAR(10)",
            "isPk": false
          },
          {
            "name": "trade_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "side",
            "type": "VARCHAR(4)",
            "isPk": false
          },
          {
            "name": "quantity",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "price",
            "type": "DECIMAL(10,2)",
            "isPk": false
          }
        ]
      }
    ]
  },
  {
    "id": "RIDES",
    "title": "Ride Hailing Network",
    "description": "Riders, driver partners, ride requests, pickup/drop coordinates and surge fares (Uber / Ola style)",
    "tables": [
      "ride_users",
      "drivers",
      "rides"
    ],
    "tableDetails": [
      {
        "tableName": "ride_users",
        "columns": [
          {
            "name": "rider_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "rider_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "signup_date",
            "type": "DATE",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "drivers",
        "columns": [
          {
            "name": "driver_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "driver_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "city",
            "type": "VARCHAR(50)",
            "isPk": false
          },
          {
            "name": "joined_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "rating",
            "type": "DECIMAL(3,2)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "rides",
        "columns": [
          {
            "name": "ride_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "rider_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "driver_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "city",
            "type": "VARCHAR(50)",
            "isPk": false
          },
          {
            "name": "request_ts",
            "type": "DATETIME",
            "isPk": false
          },
          {
            "name": "distance_km",
            "type": "DECIMAL(5,1)",
            "isPk": false
          },
          {
            "name": "fare",
            "type": "DECIMAL(8,2)",
            "isPk": false
          },
          {
            "name": "status",
            "type": "VARCHAR(20)",
            "isPk": false
          }
        ]
      }
    ]
  },
  {
    "id": "APP",
    "title": "Product Analytics & SaaS",
    "description": "Application users, daily login telemetry, user interactions and subscription MRR/ARR plans",
    "tables": [
      "app_users",
      "logins",
      "events",
      "subscriptions"
    ],
    "tableDetails": [
      {
        "tableName": "app_users",
        "columns": [
          {
            "name": "user_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "signup_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "country",
            "type": "VARCHAR(5)",
            "isPk": false
          },
          {
            "name": "plan",
            "type": "VARCHAR(15)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "logins",
        "columns": [
          {
            "name": "user_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "login_date",
            "type": "DATE",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "events",
        "columns": [
          {
            "name": "event_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "user_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "event_ts",
            "type": "DATETIME",
            "isPk": false
          },
          {
            "name": "event_type",
            "type": "VARCHAR(20)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "subscriptions",
        "columns": [
          {
            "name": "sub_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "user_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "plan",
            "type": "VARCHAR(15)",
            "isPk": false
          },
          {
            "name": "start_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "end_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "monthly_fee",
            "type": "INT",
            "isPk": false
          }
        ]
      }
    ]
  },
  {
    "id": "CRICKET",
    "title": "Sports League & Performance",
    "description": "Cricket franchises, match fixtures, player rosters and match statistics",
    "tables": [
      "teams",
      "matches",
      "players",
      "player_performance"
    ],
    "tableDetails": [
      {
        "tableName": "teams",
        "columns": [
          {
            "name": "team_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "team_name",
            "type": "VARCHAR(40)",
            "isPk": false
          },
          {
            "name": "city",
            "type": "VARCHAR(40)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "matches",
        "columns": [
          {
            "name": "match_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "match_date",
            "type": "DATE",
            "isPk": false
          },
          {
            "name": "team1_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "team2_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "winner_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "venue",
            "type": "VARCHAR(40)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "players",
        "columns": [
          {
            "name": "player_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "player_name",
            "type": "VARCHAR(60)",
            "isPk": false
          },
          {
            "name": "team_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "role",
            "type": "VARCHAR(20)",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "player_performance",
        "columns": [
          {
            "name": "match_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "player_id",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "runs",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "balls",
            "type": "INT",
            "isPk": false
          },
          {
            "name": "wickets",
            "type": "INT",
            "isPk": false
          }
        ]
      }
    ]
  },
  {
    "id": "MISC",
    "title": "Utility & Edge Testing",
    "description": "Deduplication contacts, audit sequences and backup tables",
    "tables": [
      "contacts",
      "seq_log",
      "sales_backup"
    ],
    "tableDetails": [
      {
        "tableName": "contacts",
        "columns": [
          {
            "name": "contact_id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "full_name",
            "type": "VARCHAR(80)",
            "isPk": false
          },
          {
            "name": "email",
            "type": "VARCHAR(100)",
            "isPk": false
          },
          {
            "name": "phone",
            "type": "VARCHAR(15)",
            "isPk": false
          },
          {
            "name": "created_date",
            "type": "DATE",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "seq_log",
        "columns": [
          {
            "name": "id",
            "type": "INT PRIMARY KEY",
            "isPk": true
          },
          {
            "name": "num",
            "type": "INT",
            "isPk": false
          }
        ]
      },
      {
        "tableName": "sales_backup",
        "columns": [
          {
            "name": "emp_name",
            "type": "VARCHAR(100)",
            "isPk": false
          },
          {
            "name": "salary",
            "type": "DECIMAL(10, 2)",
            "isPk": false
          }
        ]
      }
    ]
  }
];
export const SCHEMA_MAP: Record<string, SchemaInfo> = ALL_SCHEMAS.reduce((acc, s) => { acc[s.id] = s; return acc; }, {} as Record<string, SchemaInfo>);
