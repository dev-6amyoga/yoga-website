package timer

import (
	"errors"
	"fmt"
	"syncer-backend/src/events"
	"time"

	"github.com/puzpuzpuz/xsync"
	"go.uber.org/zap"
)

func NewTimerMap() TimerMap {
	return TimerMap{
		Map: xsync.NewMapOf[*Timer](),
	}
}

func (t TimerMap) AddTimer(classId string, duration float32) {
	t.Map.Store(classId, &Timer{
		CurrentTime: duration,
	})
}

func (t TimerMap) UpdateTime(classId string, duration float32, eventTime int64) error {
	ct, ok := t.Map.Load(classId)

	if !ok {
		t.Map.Store(classId, &Timer{
			CurrentTime: duration,
			LastUpdated: eventTime,
		})
	} else {
		// skip out of order events
		if ct.LastUpdated >= eventTime {
			return errors.New("out of order event")
		}

		ct.CurrentTime = duration
		t.Map.Store(classId, ct)
	}

	return nil
}

func (t *TimerMap) GetTime(classId string) float32 {
	ct, ok := t.Map.Load(classId)

	if !ok {
		return -1
	}

	return ct.CurrentTime
}

func (t *TimerMap) DeleteTimer(classId string) {
	t.Map.Delete(classId)
}

// new spec
func CalculatePosition(positionOffset float32, time int64, velocity float32, acceleration float32) float32 {
	convT := float32(time)
	return positionOffset + velocity*convT + 0.5*acceleration*convT*convT
}

func (t *TimerMap) AddTimerNew(
	classId string,
	startPosition float32,
	endPosition float32,
	velocity float32,
	acceleration float32,
) (*Timer, error) {
	zap.S().Infof("Adding timer for class %s", classId)
	// TODO: decide the interval
	newTimer := Timer{
		CurrentTime: 0,
		Ticker:      time.NewTicker(100 * time.Millisecond),
		Done:        make(chan bool, 1),
		ClassID:     classId,

		StartPosition: startPosition,
		EndPosition:   endPosition,

		Position:     CalculatePosition(startPosition, 0, velocity, acceleration),
		Velocity:     velocity,
		Acceleration: acceleration,
		LastUpdated:  time.Now().UnixMilli(),
	}

	zap.S().Infof("Storing timer to %s", classId)
	t.Map.Store(classId, &newTimer)
	zap.S().Infof("Stored to %s", classId)

	return &newTimer, nil
}

func (t *TimerMap) GetTimeVectorNew(classId string) (events.TimerVector, error) {
	ct, ok := t.Map.Load(classId)

	if !ok {
		return events.TimerVector{}, errors.New("timer not found")
	}

	return events.TimerVector{
		Position:     ct.Position,
		Velocity:     ct.Velocity,
		Acceleration: ct.Acceleration,
		Timestamp:    ct.LastUpdated,
	}, nil
}

func (t *TimerMap) UpdateTimeNew(
	classId string,
	position float32,
	velocity float32,
	acceleration float32,
	eventTime int64,
) error {
	// zap.S().Info("Updating timer for class ", classId, position, velocity, acceleration, eventTime)
	fmt.Println("Updating timer for class ", classId, position, velocity, acceleration, eventTime)
	ct, ok := t.Map.Load(classId)

	if !ok {
		return errors.New("timer not found")
	}

	ct.Position = position
	ct.Velocity = velocity
	ct.Acceleration = acceleration
	ct.LastUpdated = eventTime

	// zap.S().Info("Updated timer : ", ct)
	fmt.Println("Updated timer : ", ct.Velocity)

	t.Map.Store(classId, ct)

	return nil
}
