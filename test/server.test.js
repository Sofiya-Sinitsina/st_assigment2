const request = require("supertest");
const { app, pool } = require("../src/server");
const {response} = require("express");

beforeEach(async () => {
    await pool.query("DELETE FROM students");
    await pool.query("DELETE FROM course");
});


afterAll(async () => {
    await pool.end();
});

describe("Web Application API", () => {
    describe("Students API", () => {
        describe("GET /api/students", () => {
            it("getAllStudents_whenStudentsDoesNotExist_returns200WithEmptyArray", async () => {
                const response = await request(app).get("/api/students");

                expect(response.status).toBe(200);
                expect(response.body).toEqual([]);
            });

            it("getAllStudents_whenStudentsExist_returns200WithStudents", async () => {
                await request(app).post('/api/students').send({"name": "test", "email": "testemail@gmail.com"});
                const response = await request(app).get("/api/students");

                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body.length).toBeGreaterThan(0);
            });
        });

        describe("GET /api/students/:id", () => {
            it("getStudentById_whenStudentExist_returns200WithStudent", async () => {
                await request(app).post('/api/students').send({"name": "test", "email": "testemail@gmail.com"});
                const students = await request(app).get("/api/students");
                const studentId = students.body[0].id;
                const response = await request(app).get(`/api/students/${studentId}`);

                expect(response.status).toBe(200);
                expect(response.body.name).toEqual("test");
            });

            it("getStudentById_whenStudentDoesNotExist_returns404WithError", async () => {
                const response = await request(app).get("/api/students/1");

                expect(response.status).toBe(404);
                expect(response.body).toEqual({ error: "Student not found" });
            });

            it("getStudentById_whenIdIsNotProvided_returns400WithError", async () => {
                const response = await request(app).get("/api/students/abc");

                expect(response.status).toBe(400);
                expect(response.body).toEqual({ error: "Invalid student ID" });
            });
        });

        describe("POST /api/students", () => {
            it("postStudent_whenAllFieldsProvided_returns201WithStudent", async () => {
                const response = await request(app)
                    .post('/api/students')
                    .send({"name": "test", "email": "testPostEmail@gmail.com"});

                expect(response.status).toBe(201);
                expect(response.body.email).toEqual("testPostEmail@gmail.com");
            });

            it("postStudent_whenNameIsNotProvided_returns400WithError", async () => {
                const response = await request(app)
                    .post('/api/students')
                    .send({"email": "testPostEmail@gmail.com"});

                expect(response.status).toBe(400);
                expect(response.body).toEqual({ error: "Invalid input" });
            });
        });

        describe("PUT /api/students/:id", () => {
            it("postStudents_whenAllFieldsProvided_returns200WithStudent", async () => {
                await request(app).post('/api/students').send({"name": "test", "email": "testemail@gmail.com"});
                const students = await request(app).get("/api/students");
                const studentId = students.body[0].id;
                const response = await request(app)
                    .put(`/api/students/${studentId}`)
                    .send({"name": "testPut", "email": "testPut@gmail.com"});

                expect(response.status).toBe(200);
                expect(response.body.name).toEqual("testPut");
            });

            it("postStudents_whenEmailIsNotProvided_returns400WithError", async () => {
                await request(app).post('/api/students').send({"name": "test", "email": "testemail@gmail.com"});
                const students = await request(app).get("/api/students");
                const studentId = students.body[0].id;
                const response = await request(app)
                    .put(`/api/students/${studentId}`)
                    .send({"name": "testPut"});

                expect(response.status).toBe(400);
                expect(response.body).toEqual({ error: "All fields should be filled in" });
            });

            it("postStudents_whenInvalidIdProvided_returns404WithError", async () => {
                const response = await request(app)
                    .put("/api/students/12345")
                    .send({"name": "testPut", "email": "testPut@gmail.com"});

                expect(response.status).toBe(404);
                expect(response.body).toEqual({ error: "Student not found" });
            });
        });
    });



    describe("Courses API", () => {
        describe("GET /api/courses", () => {
            it("getAllCourses_whenCoursesExist_returns200WithCourses", async () => {
                await request(app).post('/api/courses').send({"course_name": "test", "instructor": "testInstructor", "credit_hours": 4});
                const response = await request(app).get("/api/courses");

                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body.length).toBeGreaterThan(0);
            });

            it("getAllCourses_whenCoursesDoesNotExist_returns200WithEmptyArray", async () => {
                const response = await request(app).get("/api/courses");

                expect(response.status).toBe(200);
                expect(response.body).toEqual([]);
            });
        });

        describe("GET /api/courses/:id", () => {
            it("getCourseById_whenCourseExist_returns200WithCourse", async () => {
                await request(app).post('/api/courses').send({"course_name": "test", "instructor": "testInstructor", "credit_hours": 4});
                const courses = await request(app).get("/api/courses");
                const courseId = courses.body[0].id;
                const response = await request(app).get(`/api/courses/${courseId}`);

                expect(response.status).toBe(200);
                expect(response.body.course_name).toEqual("test");
            });

            it("etCourseById_whenCourseDoesNotExist_returns404WithError", async () => {
                const response = await request(app).get("/api/courses/12345");

                expect(response.status).toBe(404);
                expect(response.body).toEqual({ error: "Course not found" });
            });

            it("getCourseById_whenIdIsNotProvided_returns400WithError", async () => {
                const response = await request(app).get("/api/courses/abc");

                expect(response.status).toBe(400);
                expect(response.body).toEqual({ error: "Invalid course ID" });
            });
        });

        describe("POST /api/courses", () => {
            it("postCourse_whenAllFieldsProvided_returns201WithCourse", async () => {
                const response = await request(app)
                    .post('/api/courses')
                    .send({"course_name": "testPost", "instructor": "testInstructorPost", "credit_hours": 5});

                expect(response.status).toBe(201);
                expect(response.body.instructor).toEqual("testInstructorPost");
            });

            it("postCourse_whenCourseNameIsNotProvided_returns400WithError", async () => {
                const response = await request(app)
                    .post('/api/courses')
                    .send({"instructor": "testInstructorPost", "credit_hours": 5});

                expect(response.status).toBe(400);
                expect(response.body).toEqual({ error: "Invalid input" });
            });
        });

        describe("PUT & PATCH /api/courses/:id", () => {
            it("postCourses_whenAllFieldsProvided_returns200WithCourse", async () => {
                await request(app).post('/api/courses').send({"course_name": "testPost", "instructor": "testInstructorPost", "credit_hours": 5});
                const course = await request(app).get("/api/courses");
                const courseId = course.body[0].id;
                const response = await request(app)
                    .put(`/api/courses/${courseId}`)
                    .send({"course_name": "testPut", "instructor": "testInstructorPut", "credit_hours": 4});

                expect(response.status).toBe(200);
                expect(response.body.course_name).toEqual("testPut");
            });

            it("patchCourse_whenAllFieldsProvided_returns200WithCourse", async () => {
                await request(app).post('/api/courses').send({"course_name": "testPost", "instructor": "testInstructorPost", "credit_hours": 5});
                const course = await request(app).get("/api/courses");
                const courseId = course.body[0].id;
                const response = await request(app)
                    .patch(`/api/courses/${courseId}`)
                    .send({"course_name": "testPatch"});

                expect(response.status).toBe(200);
                expect(response.body.course_name).toEqual("testPatch");
            });
        });
    });

    describe("Enrollment final grade", () => {
        it("getFinalGrade_whenStudentIdAndCourseId_returns200WithFinalGrade", async () => {
            await request(app).post('/api/students').send({"name": "test", "email": "testemail@gmail.com"});
            const students = await request(app).get("/api/students");
            const studentId = students.body[0].id;

            await request(app).post('/api/courses').send({"course_name": "testPost", "instructor": "testInstructorPost", "credit_hours": 5});
            const course = await request(app).get("/api/courses");
            const courseId = course.body[0].id;

            await request(app)
                .post("/api/enrollments")
                .send(
                    {
                        "student_id": studentId,
                        "course_id": courseId,
                        "assignment1": 85.5,
                        "assignment2": 90,
                        "midterm_exam": 78,
                        "final_exam": 88,
                        "final_project": 92
                    }
                );

            const response = await request(app).get(`/api/enrollments/${studentId}/${courseId}`);

            expect(response.status).toBe(200);
            expect(response.body).toBe(85.325);
        })
    })
});