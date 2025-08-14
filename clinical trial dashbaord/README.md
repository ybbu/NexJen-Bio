# Clinical Trial Research Platform

A comprehensive web-based platform for exploring, analyzing, and tracking clinical trials with AI-powered insights. Built specifically for clinical research professionals, pharmaceutical companies, and researchers working on clinical trial discovery and analysis.

## 🚀 Features

### **Core Functionality**
- **🔍 Trial Explorer** - Advanced search and filtering across global clinical trials
- **📊 Analytics Dashboard** - Comprehensive trial metrics and trend analysis  
- **🤝 Collaboration Network** - Sponsor and investigator relationship mapping
- **💡 Research Insights** - AI-powered research trends and publication tracking
- **📋 Trial Tracker** - Real-time trial monitoring with predictive analytics
- **📚 Trial Database** - Structured access to trial data with quality scoring

### **Advanced Analytics**
- **Quality Scoring System** - Proprietary 0-5 scale trial quality assessment
- **Success Prediction** - Phase transition probability modeling
- **Risk Assessment** - Enrollment and design risk forecasting
- **Trend Analysis** - Multi-dimensional research trend identification
- **Network Analysis** - Collaboration and competition mapping

### **AI-Powered Features**
- **Smart Search** - Intelligent autocomplete with domain-specific suggestions
- **Predictive Insights** - Trial success probability and risk factors
- **Research Gap Detection** - Identifies underexplored therapeutic areas
- **Automated Summaries** - AI-generated trial and research summaries

## 🛠 Technology Stack

### **Backend**
- **FastAPI** - High-performance Python web framework
- **Pandas & NumPy** - Data processing and numerical computing
- **scikit-learn** - Machine learning for predictive analytics
- **NetworkX** - Network analysis for collaboration mapping
- **ClinicalTrials.gov API** - Real-time clinical trial data

### **Frontend**
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Router** - Client-side routing and navigation
- **Axios** - HTTP client for API communication
- **Lucide React** - Modern icon library

### **Data & Analytics**
- **Vector Embeddings** - Semantic similarity for trial matching
- **Network Analysis** - Collaboration and influence mapping
- **Time Series Analysis** - Trend detection and forecasting
- **Quality Scoring** - Multi-factor trial assessment algorithm

## 🚀 Quick Start

### **Prerequisites**
- Python 3.8+ 
- Node.js 16+
- npm or yarn

### **Backend Setup**

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the FastAPI server:**
   ```bash
   python main.py
   ```
   
   🌐 API available at `http://localhost:8000`
   📚 API docs at `http://localhost:8000/docs`

### **Frontend Setup**

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   
   🌐 App available at `http://localhost:3000`

### **Quick Launch (Both Services)**
```bash
# From project root
chmod +x start.sh
./start.sh
```

## 📱 Application Overview

### **🔍 Trial Explorer**
- **Smart Search**: Intelligent autocomplete with 80+ medical terms
- **Advanced Filters**: Phase, intervention, sponsor, location, enrollment
- **Quality Scores**: Proprietary scoring system for trial assessment
- **Multiple Views**: Cards, list, and map visualizations
- **Real-time Metrics**: Live trial counts and statistics

### **📊 Analytics Dashboard** 
- **Trend Analysis**: Multi-year research trend identification
- **Phase Distribution**: Visual breakdown of trial phases
- **Geographic Analysis**: Global trial distribution mapping
- **Success Metrics**: Historical success rates by phase and indication

### **🤝 Collaboration Network**
- **Network Visualization**: Interactive sponsor and investigator networks
- **Influence Metrics**: Centrality and collaboration scores
- **Relationship Mapping**: Sponsor-investigator connections
- **Competitive Intelligence**: Market positioning analysis

### **💡 Research Insights**
- **Publication Tracking**: Latest research publications and impact
- **Trend Identification**: Emerging therapeutic areas
- **Gap Analysis**: Underexplored research opportunities
- **Success Metrics**: Phase transition rates and approval probabilities

### **📋 Trial Tracker**
- **Real-time Monitoring**: Live trial status and enrollment tracking
- **Predictive Analytics**: Success probability modeling
- **Risk Assessment**: Design and enrollment risk factors
- **Phase-specific Insights**: Timeline, design, implementation, monitoring

## 🔧 API Reference

### **Core Endpoints**
```bash
# Get filtered trials with metrics
POST /trials
{
  "condition": "Parkinson's Disease",
  "phase": "PHASE2",
  "intervention": "rotigotine",
  "studyType": "INTERVENTIONAL"
}

# Get analytics and trends
GET /analytics

# Get collaboration network data
GET /network

# Get research insights
GET /insights

# Get quality scores
GET /scores
```

### **Response Format**
```json
{
  "trials": [...],
  "metrics": {
    "trial_count": 156,
    "active_trials": 89,
    "recent_trials": 23,
    "avg_score": 3.2
  },
  "sponsor_breakdown": {...}
}
```

## 📊 Quality Scoring System

### **Score Ranges**
- **🟢 Highly Reliable (4.0+)**: Excellent design and execution
- **🟢 Reliable (3.0-4.0)**: Good quality with minor concerns  
- **🟡 Moderate (1.6-3.0)**: Acceptable with some limitations
- **🟠 Risky (0.8-1.6)**: Significant concerns present
- **🔴 Highly Risky (0.0-0.8)**: Major quality issues

### **Scoring Components**
- **Study Design**: Protocol quality and methodology
- **Sponsor Track Record**: Historical success rates
- **Enrollment Metrics**: Target vs actual enrollment
- **Timeline Adherence**: Schedule compliance
- **Regulatory Compliance**: FDA/EMA alignment

## 🗂 Project Structure

```
clinical-trial-platform/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   ├── models/             # Data models and schemas
│   └── utils/              # Utility functions
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js          # Main application component
│   │   └── config.js       # Configuration settings
│   └── public/             # Static assets
├── data/                   # Data files and datasets
├── scoring_system/         # Quality scoring algorithms
└── README.md              # This file
```

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Code Standards**
- **Python**: Follow PEP 8, use type hints
- **JavaScript**: ESLint configuration, functional components
- **CSS**: Tailwind CSS utilities, responsive design
- **Documentation**: Clear docstrings and comments

## 🐛 Troubleshooting

### **Common Issues**

**Backend Issues:**
- **Import Errors**: Ensure virtual environment is activated
- **Data Loading**: Verify data files exist in `/data` directory
- **API Timeouts**: Check network connectivity to ClinicalTrials.gov

**Frontend Issues:**
- **Build Errors**: Delete `node_modules` and run `npm install`
- **API Connection**: Verify backend server is running on port 8000
- **Styling Issues**: Check Tailwind CSS configuration

**Performance:**
- **Large Datasets**: Implement pagination for better performance
- **API Optimization**: Use request caching and debouncing
- **Memory Usage**: Monitor data processing for large trial sets

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♀️ Support

For questions, issues, or contributions:

1. 📖 Check the [API Documentation](http://localhost:8000/docs)
2. 🐛 [Open an Issue](https://github.com/your-repo/clinical-trial-platform/issues)
3. 💬 [Start a Discussion](https://github.com/your-repo/clinical-trial-platform/discussions)
4. 📧 Contact the development team

---

**🏥 Built for the clinical research community with ❤️**

*Empowering researchers, clinicians, and pharmaceutical companies with AI-driven insights for better clinical trial outcomes.*