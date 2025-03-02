package wssyncer

import (
	"testing"
)

func TestNewServer(t *testing.T) {
	s := NewServer()

	if s == nil {
		t.Error("Server not created")
		t.FailNow()
	}
}

func TestTeacherConnection(t *testing.T) {
	t.Fail()
}

func TestStudentConnection(t *testing.T) {
	t.Fail()
}

// Teacher
func TestTeacherQueueActionSingleSuccess(t *testing.T) {
	t.Fail()
}

func TestTeacherQueueActionMultipleSuccess(t *testing.T) {
	t.Fail()
}

func TestTeacherQueueActionWrongJson(t *testing.T) {
	t.Fail()
}

// Student
func TestStudentQueueActionSingleSuccess(t *testing.T) {
	t.Fail()
}

func TestStudentQueueActionMultipleSuccess(t *testing.T) {
	t.Fail()
}

func TestStudent(t *testing.T) {
	t.Fail()
}
