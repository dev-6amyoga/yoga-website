package timer

import (
	"errors"
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

func (t TimerMap) AddTimer(classID string, duration float32) {
	t.Map.Store(classID, &Timer{
		CurrentTime: duration,
	})
}

func (t TimerMap) UpdateTime(classID string, duration float32, eventTime int64) error {
	ct, ok := t.Map.Load(classID)

	if !ok {
		t.Map.Store(classID, &Timer{
			CurrentTime: duration,
			LastUpdated: eventTime,
		})
	} else {
		// skip out of order events
		if ct.LastUpdated >= eventTime {
			return errors.New("out of order event")
		}

		ct.CurrentTime = duration
		t.Map.Store(classID, ct)
	}

	return nil
}

func (t *TimerMap) GetTime(classID string) float32 {
	ct, ok := t.Map.Load(classID)

	if !ok {
		return -1
	}

	return ct.CurrentTime
}

func (t *TimerMap) DeleteTimer(classID string) {
	t.Map.Delete(classID)
}

// new spec
func CalculatePosition(positionOffset float32, time float32, velocity float32, acceleration float32) float32 {
	// convT := float32(time)
	return positionOffset + velocity*time + 0.5*acceleration*time*time
}

func (t *TimerMap) AddTimerNew(
	classID string,
	startPosition float32,
	endPosition float32,
	velocity float32,
	acceleration float32,
) (*Timer, error) {
	log := zap.S()

	log.Debugf("Adding timer for class %s", classID)
	// TODO: decide the interval
	newTimer := Timer{
		CurrentTime: 0,
		Ticker:      time.NewTicker(100 * time.Millisecond),
		Done:        make(chan bool, 1),
		ClassID:     classID,

		StartPosition: startPosition,
		EndPosition:   endPosition,

		Position:     CalculatePosition(startPosition, 0, velocity, acceleration),
		Velocity:     velocity,
		Acceleration: acceleration,
		LastUpdated:  time.Now().UnixMilli(),
	}

	log.Debugf("Storing timer to %s", classID)
	t.Map.Store(classID, &newTimer)
	log.Debugf("Stored to %s", classID)

	return &newTimer, nil
}

func (t *TimerMap) GetTimeVectorNew(classID string) (events.TimerVector, error) {
	ct, ok := t.Map.Load(classID)

	if !ok {
		return events.TimerVector{}, errors.New("timer not found")
	}

	return events.TimerVector{
		Position:     &ct.Position,
		Velocity:     &ct.Velocity,
		Acceleration: &ct.Acceleration,
		Timestamp:    ct.LastUpdated,
	}, nil
}

func (t *TimerMap) UpdateTimeNew(
	classID string,
	position float32,
	velocity float32,
	acceleration float32,
	eventTime int64,
) error {
	log := zap.S()

	// log.Debugf("Updating timer for class ", classID, position, velocity, acceleration, eventTime)
	ct, ok := t.Map.Load(classID)

	if !ok {
		return errors.New("timer not found")
	}

	if position != -1 {
		ct.Position = position
	}
	if velocity != -1 {
		ct.Velocity = velocity
	}
	if acceleration != -1 {
		ct.Acceleration = acceleration
	}

	// TODO : check if this is correct
	// ct.LastUpdated = eventTime

	log.Debugf("Updated timer : ", ct.Position, ct.Velocity, ct.Acceleration, ct.LastUpdated)

	t.Map.Store(classID, ct)

	return nil
}
