const express = require("express");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
    host: "localhost",
    database: process.env.NODE_ENV === "test" ? "scmtest" : "scm",
    user: "postgres",
    password: "password",
    port: 5432,
});

app.use(express.json());

// ------------------------ Students ------------------------
app.get("/api/students", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM students ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: "Database error"});
    }
});

app.get("/api/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = parseInt(id, 10);

        if (isNaN(studentId))
            return res.status(400).json({ error: "Invalid student ID" });

        const result = await pool.query("SELECT * FROM students WHERE id = $1", [studentId]);

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Student not found" });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.post("/api/students", async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ error: "Invalid input" });

        const result = await pool.query(
            "INSERT INTO students (name, email) VALUES ($1, $2) RETURNING *",
            [name, email]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.put("/api/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = parseInt(id);
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ error: "All fields should be filled in" });

        const result = await pool.query(
            "UPDATE students SET name = $1, email = $2 WHERE id = $3 RETURNING *",
            [name, email, studentId]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Student not found" });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.patch("/api/students/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const studentId = parseInt(id);
        const {name, email} = req.body;

        const current = await pool.query(
            "SELECT * FROM students WHERE id = $1",
            [studentId]
        );

        const student = current.rows[0];

        const updatedName = name ?? student.name;
        const updatedEmail = email ?? student.email;

        const result = await pool.query(
            "UPDATE students SET name = $1, email = $2 WHERE id = $3 RETURNING *",
            [updatedName, updatedEmail, studentId]
        );

        if (result.rows.length === 0)
            return res.status(404).json({error: "Student not found"});

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.delete("/api/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = parseInt(id);

        const result = await pool.query("DELETE FROM students WHERE id = $1 RETURNING *", [studentId]);

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Student not found" });

        res.json({ message: "Student deleted" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
})

// ------------------------ Courses ------------------------
app.get("/api/courses", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM course ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: "Database error"});
    }
});

app.get("/api/courses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const courseId = parseInt(id, 10);

        if (isNaN(courseId))
            return res.status(400).json({ error: "Invalid course ID" });

        const result = await pool.query("SELECT * FROM course WHERE id = $1", [courseId]);

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Course not found" });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.post("/api/courses", async (req, res) => {
    try {
        const { course_name, instructor, credit_hours  } = req.body;
        if (!course_name || !instructor || !credit_hours) return res.status(400).json({ error: "Invalid input" });

        const result = await pool.query(
            "INSERT INTO course (course_name, instructor, credit_hours) VALUES ($1, $2, $3) RETURNING *",
            [course_name, instructor, credit_hours]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.put("/api/courses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const courseId = parseInt(id);
        const { course_name, instructor, credit_hours } = req.body;

        if (!course_name || !instructor || !credit_hours) return res.status(400).json({ error: "All fields should be filled in!" });

        const result = await pool.query(
            "UPDATE course SET course_name = $1, instructor = $2, credit_hours = $3  WHERE id = $4 RETURNING *",
            [course_name, instructor, credit_hours, courseId]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Course not found" });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.patch("/api/courses/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const courseId = parseInt(id);
        const {course_name, instructor, credit_hours} = req.body;

        const current = await pool.query(
            "SELECT * FROM course WHERE id = $1",
            [courseId]
        );

        const course = current.rows[0];

        const updatedCourseName = course_name ?? course.course_name;
        const updatedInstructor = instructor ?? course.instructor;
        const updatedCreditHours = credit_hours ?? course.credit_hours;

        const result = await pool.query(
            "UPDATE course SET course_name = $1, instructor = $2, credit_hours = $3 WHERE id = $4 RETURNING *",
            [updatedCourseName, updatedInstructor, updatedCreditHours, courseId]
        );

        if (result.rows.length === 0)
            return res.status(404).json({error: "Course not found"});

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.delete("/api/courses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const courseId = parseInt(id);

        const result = await pool.query("DELETE FROM course WHERE id = $1 RETURNING *", [courseId]);

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Course not found" });

        res.json({ message: "Course deleted" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
})


// ------------------------ Enrollments ------------------------
app.post('/api/enrollments', async (req, res) => {
    try {
        const {student_id, course_id, assignment1, assignment2, midterm_exam, final_exam, final_project} = req.body;

        const result = await pool.query(
            "INSERT INTO enrollment (student_id, course_id, assignment1, assignment2, midterm_exam, final_exam, final_project) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
            [student_id, course_id, assignment1, assignment2, midterm_exam, final_exam, final_project]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/enrollments', async (req, res) => {
    const { student_id, course_id } = req.query;

    try {
        let query = "SELECT * FROM enrollment WHERE 1=1";
        const values = [];

        if (student_id) {
            values.push(student_id);
            query += ` AND student_id = $${values.length}`;
        }

        if (course_id) {
            values.push(course_id);
            query += ` AND course_id = $${values.length}`;
        }

        const result = await pool.query(query, values);

        if (student_id && course_id) {
            return res.json(result.rows[0] || "This student is not enrolled to this course");
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/enrollments/:studentId/:courseId', async (req, res) => {
    try {
        const { studentId, courseId } = req.params;

        const result = await pool.query(
            "SELECT * FROM enrollment WHERE student_id = $1 AND course_id = $2",
            [studentId, courseId]
        );

        data = result.rows[0];

        final_score = Number(data.assignment1)*0.15 + Number(data.assignment2)*0.15 + Number(data.midterm_exam)*0.3 + Number(data.final_exam)*0.3 + Number(data.final_project)*0.1;

        res.json(final_score);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = { app, pool };