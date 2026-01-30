

---

# **📘 PRODUCT REQUIREMENTS DOCUMENT (PRD)**

## **Personal Canvas Student Dashboard — Backend APIs**

---

## **1\. 📌 Product Overview**

### **Product Name (Working)**

**Personal Canvas Dashboard**

### **Description**

A personal, read-only dashboard for students that aggregates their Canvas LMS data into a single interface, showing:

* Active courses  
* Latest course updates (announcements, assignments)  
* Assignment contents  
* Grade tracking per course and per assignment

The backend acts as a **secure data orchestration layer** between the Canvas LMS API and frontend clients.

---

## **2\. 🎯 Goals & Objectives**

### **Primary Goals**

* Provide students a **centralized academic overview**  
* Reduce the need to open multiple Canvas course pages  
* Present clean, aggregated, and time-filtered data

### **Backend-Specific Goals**

* Abstract Canvas API complexity  
* Normalize and cache Canvas responses  
* Enforce student-level access boundaries  
* Provide frontend-ready APIs

---

## **3\. 👤 Target User**

### **User Type**

* **Canvas Student**  
* Authenticated via **Personal Access Token** or delegated auth

### **Permissions**

* Read-only access  
* Limited to enrolled courses and visible content only

---

## **4\. 🔐 Authentication & Security Requirements**

### **Authentication Model**

* Student provides a **Canvas Personal Access Token**  
* Token stored securely (encrypted at rest)  
* Token scoped to student permissions only

### **Authorization Rules**

* Backend must **never escalate permissions**  
* All data returned must reflect:  
  * Student role  
  * Course enrollment  
  * Canvas visibility rules

### **Security Constraints**

* No write operations to Canvas  
* No token sharing between users  
* Rate-limit backend endpoints

---

## **5\. 🧩 Functional Requirements (Backend APIs)**

---

### **5.1 Course Management**

#### **Purpose**

Serve enrolled course data as the backbone of the dashboard.

#### **Backend Responsibilities**

* Fetch active courses from Canvas  
* Normalize course data  
* Attach grade summaries

#### **Data Points**

* Course ID  
* Course name  
* Course code  
* Term  
* Enrollment status  
* Current grade / score (if available)

---

### **5.2 Latest Course Activity Feed**

#### **Purpose**

Provide a **monthly feed** of academic updates.

#### **Includes**

* Announcements  
* Assignments (new or due this month)

#### **Backend Responsibilities**

* Aggregate posts across all courses  
* Filter by date (current month)  
* Sort chronologically  
* Tag each item with its course

#### **Data Points**

* Type (announcement / assignment)  
* Title  
* Course ID \+ name  
* Posted date  
* Due date (if applicable)  
* Short preview

---

### **5.3 Assignment Management**

#### **Purpose**

Allow students to view assignment metadata and full content.

#### **Backend Responsibilities**

* Fetch assignment lists per course  
* Support lazy loading of full assignment content  
* Extract and sanitize HTML descriptions

#### **Data Points**

* Assignment ID  
* Title  
* Description (HTML)  
* Due date  
* Points possible  
* Submission status  
* Attachments (files, links)

---

### **5.4 Grade Tracking**

#### **Purpose**

Track academic performance clearly and accurately.

#### **Backend Responsibilities**

* Fetch overall course grades  
* Fetch assignment-level grades  
* Compute derived stats (optional)

#### **Data Points**

* Course current grade  
* Assignment score  
* Points possible  
* Submission state  
* Late/missing flags

---

### **5.5 Caching & Performance**

#### **Requirements**

* Cache frequently accessed data:  
  * Courses  
  * Announcements  
  * Grades  
* Use time-based cache invalidation  
* Avoid redundant Canvas API calls

#### **Suggested Cache Windows**

* Courses: 1–6 hours  
* Announcements: 15–30 minutes  
* Grades: 30–60 minutes  
* Assignment content: on-demand

---

## **6\. 🚦 Non-Functional Requirements**

### **Performance**

* Initial dashboard load \< 3 seconds (cached)  
* Graceful handling of Canvas API latency

### **Reliability**

* Handle Canvas API rate limits (HTTP 429\)  
* Automatic retry with backoff  
* Partial data loading allowed

### **Scalability**

* Designed for multiple students  
* Stateless API design  
* Token-isolated data access

### **Compliance**

* Respect institutional Canvas policies  
* No scraping  
* No bypassing locked content

---

## **7\. 📡 Backend API Endpoints (Logical Design)**

These are **your own backend APIs**, not Canvas endpoints.

### **Example API Groups**

* `/auth`  
* `/courses`  
* `/feed`  
* `/assignments`  
* `/grades`

Each endpoint should:

* Call Canvas API  
* Normalize data  
* Cache results  
* Return frontend-friendly JSON

---

## **8\. ❌ Explicit Out-of-Scope**

* Modifying Canvas data  
* Submitting assignments  
* Messaging users  
* Viewing other students’ data  
* Admin or instructor tools

---

## **9\. ⚠️ Risks & Constraints**

| Risk | Mitigation |
| ----- | ----- |
| Canvas rate limits | Caching \+ batching |
| Token revocation | Graceful auth failure handling |
| HTML rendering risks | Sanitize assignment content |
| API changes | Version backend APIs |

---

## **10\. 📈 Success Metrics**

* Dashboard loads successfully  
* Accurate grade reflection  
* Reduced Canvas page switching  
* No rate-limit violations

---

