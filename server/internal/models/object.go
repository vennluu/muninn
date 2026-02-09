package models

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/pkg/ctype"
	"github.com/google/uuid"
)

type Object struct {
	ID          uuid.UUID         `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	IDString    string            `json:"idString"`
	CreatorID   uuid.UUID         `json:"creatorId"`
	CreatedAt   time.Time         `json:"createdAt"`
	DeletedAt   ctype.NullTime    `json:"-"`
	Tags        []database.Tag    `json:"tags"`
	TypeValues  []ObjectTypeValue `json:"typeValues"`
}

type ListObjectsByOrgIdRow struct {
	ID                uuid.UUID   `json:"id"`
	Name              string      `json:"name"`
	Photo             string      `json:"photo"`
	Description       string      `json:"description"`
	IDString          string      `json:"idString"`
	CreatedAt         time.Time   `json:"createdAt"`
	MatchSource       string      `json:"matchSource"`
	ObjHeadline       string      `json:"objHeadline"`
	FactHeadline      string      `json:"factHeadline"`
	TypeValueHeadline string      `json:"typeValueHeadline"`
	SearchRank        float64     `json:"searchRank"`
	Tags              interface{} `json:"tags"`
	TypeValues        interface{} `json:"typeValues"`
}

type ObjectTypeValue struct {
	ID               uuid.UUID              `json:"id"`
	ObjectTypeID     uuid.UUID              `json:"objectTypeId"`
	ObjectTypeName   string                 `json:"objectTypeName"`
	ObjectTypeIcon   string                 `json:"objectTypeIcon"`
	ObjectTypeFields map[string]interface{} `json:"objectTypeFields"`
	TypeValues       map[string]interface{} `json:"type_values"`
}

type ObjectModel struct {
	DB *database.Queries
}

type ObjectDetail struct {
	ID              uuid.UUID         `json:"id"`
	Name            string            `json:"name"`
	Description     string            `json:"description"`
	IDString        string            `json:"idString"`
	CreatorID       uuid.UUID         `json:"creatorId"`
	CreatedAt       time.Time         `json:"createdAt"`
	Tags            []database.Tag    `json:"tags"`
	TypeValues      []ObjectTypeValue `json:"typeValues"`
	Tasks           []Task            `json:"tasks"`
	StepsAndFunnels []StepAndFunnel   `json:"stepsAndFunnels"`
	Facts           []Fact            `json:"facts"`
	Aliases         []string          `json:"aliases"`
}

type Task struct {
	ID         uuid.UUID      `json:"id"`
	Content    string         `json:"content"`
	Deadline   ctype.NullTime `json:"deadline"`
	Status     string         `json:"status"`
	CreatedAt  time.Time      `json:"createdAt"`
	AssignedID ctype.NullUUID `json:"assignedId"`
	DeletedAt  ctype.NullTime `json:"deletedAt"`
}

type StepAndFunnel struct {
	ID         uuid.UUID      `json:"id"`
	StepID     uuid.UUID      `json:"stepId"`
	StepName   string         `json:"stepName"`
	FunnelID   uuid.UUID      `json:"funnelId"`
	FunnelName string         `json:"funnelName"`
	SubStatus  int32          `json:"subStatus"`
	DeletedAt  ctype.NullTime `json:"deletedAt"`
	CreatedAt  time.Time      `json:"createdAt"`
}

type Fact struct {
	ID         uuid.UUID      `json:"id"`
	Text       string         `json:"text"`
	HappenedAt ctype.NullTime `json:"happenedAt"`
	Location   string         `json:"location"`
	CreatedAt  time.Time      `json:"createdAt"`
}

func NewObjectModel(db *database.Queries) *ObjectModel {
	return &ObjectModel{DB: db}
}

func (m *ObjectModel) Create(ctx context.Context, name, description, idString string, creatorID uuid.UUID) (*Object, error) {
	obj, err := m.DB.CreateObject(ctx, database.CreateObjectParams{
		Name:        name,
		Description: description,
		IDString:    idString,
		CreatorID:   creatorID,
	})
	if err != nil {
		return nil, err
	}

	return &Object{
		ID:          obj.ID,
		Name:        obj.Name,
		Description: obj.Description,
		IDString:    obj.IDString,
		CreatorID:   obj.CreatorID,
		CreatedAt:   obj.CreatedAt,
	}, nil
}

func (m *ObjectModel) Update(ctx context.Context, id uuid.UUID, name, description, idString string, aliases []string) (*Object, error) {
	obj, err := m.DB.UpdateObject(ctx, database.UpdateObjectParams{
		ID:          id,
		Name:        name,
		Description: description,
		IDString:    idString,
		Aliases:     aliases,
	})
	if err != nil {
		return nil, err
	}

	return &Object{
		ID:          obj.ID,
		Name:        obj.Name,
		Description: obj.Description,
		IDString:    obj.IDString,
		CreatorID:   obj.CreatorID,
		CreatedAt:   obj.CreatedAt,
	}, nil
}

func (m *ObjectModel) Delete(ctx context.Context, id uuid.UUID) error {
	return m.DB.DeleteObject(ctx, id)
}

func (m *ObjectModel) List(ctx context.Context, orgID uuid.UUID, search string, limit, offset int32) ([]ListObjectsByOrgIdRow, int64, error) {
	objects, err := m.DB.ListObjectsByOrgID(ctx, database.ListObjectsByOrgIDParams{
		OrgID:   orgID,
		Column2: search,
		Limit:   limit,
		Offset:  offset,
	})
	if err != nil {
		return nil, 0, err
	}
	count, err := m.DB.CountObjectsByOrgID(ctx, database.CountObjectsByOrgIDParams{
		OrgID:   orgID,
		Column2: search,
	})
	if err != nil {
		return nil, 0, err
	}
	result := make([]ListObjectsByOrgIdRow, len(objects))
	for i, obj := range objects {
		var tags []database.Tag
		var typeValues []ObjectTypeValue

		switch v := obj.Tags.(type) {
		case []byte:
			if len(v) > 0 {
				if err := json.Unmarshal(v, &tags); err != nil {
					return nil, 0, err
				}
			}
		case string:
			if len(v) > 0 {
				if err := json.Unmarshal([]byte(v), &tags); err != nil {
					return nil, 0, err
				}
			}
		}

		switch v := obj.TypeValues.(type) {
		case []byte:
			if len(v) > 0 {
				if err := json.Unmarshal(v, &typeValues); err != nil {
					return nil, 0, err
				}
			}
		case string:
			if len(v) > 0 {
				if err := json.Unmarshal([]byte(v), &typeValues); err != nil {
					return nil, 0, err
				}
			}
		}
		finalSearchRank := 0.0
		if obj.SearchRank != nil {
			switch v := obj.SearchRank.(type) {
			case float64:
				finalSearchRank = v
			case float32:
				finalSearchRank = float64(v)
			}
		}

		var objHeadline string
		switch v := obj.ObjHeadline.(type) {
		case string:
			objHeadline = v
		case []byte:
			objHeadline = string(v)
		}

		var factHeadline string
		switch v := obj.FactHeadline.(type) {
		case string:
			factHeadline = v
		case []byte:
			factHeadline = string(v)
		}

		var typeValueHeadline string
		switch v := obj.TypeValueHeadline.(type) {
		case string:
			typeValueHeadline = v
		case []byte:
			typeValueHeadline = string(v)
		}

		result[i] = ListObjectsByOrgIdRow{
			ID:                obj.ID,
			Name:              obj.Name,
			Photo:             obj.Photo,
			Description:       obj.Description,
			IDString:          obj.IDString,
			CreatedAt:         obj.CreatedAt,
			MatchSource:       obj.MatchSource,
			ObjHeadline:       objHeadline,
			FactHeadline:      factHeadline,
			TypeValueHeadline: typeValueHeadline,
			SearchRank:        finalSearchRank,
			Tags:              tags,
			TypeValues:        typeValues,
		}
	}

	return result, count, nil
}

func (m *ObjectModel) GetDetails(ctx context.Context, id, orgID uuid.UUID) (*ObjectDetail, error) {
	data, err := m.DB.GetObjectDetails(ctx, database.GetObjectDetailsParams{
		ID:    id,
		OrgID: orgID,
	})
	if err != nil {
		fmt.Println("error getting object details:", err)
		return nil, err
	}
	var tags []database.Tag
	var typeValues []ObjectTypeValue
	var tasks []Task
	var stepsAndFunnels []StepAndFunnel
	var facts []Fact

	switch v := data.Tags.(type) {
	case []byte:
		if err := json.Unmarshal(v, &tags); err != nil {
			return nil, fmt.Errorf("error unmarshalling tags: %w", err)
		}
	case string:
		if err := json.Unmarshal([]byte(v), &tags); err != nil {
			return nil, fmt.Errorf("error unmarshalling tags: %w", err)
		}
	case nil:
		// do nothing
	default:
		return nil, fmt.Errorf("expected []byte or string for Tags, got %T", data.Tags)
	}

	switch v := data.TypeValues.(type) {
	case []byte:
		if err := json.Unmarshal(v, &typeValues); err != nil {
			fmt.Println("Error unmarshalling type values:", err)
			return nil, err
		}
	case string:
		if err := json.Unmarshal([]byte(v), &typeValues); err != nil {
			fmt.Println("Error unmarshalling type values:", err)
			return nil, err
		}
	case nil:
		// do nothing
	default:
		return nil, fmt.Errorf("expected []byte or string for TypeValues, got %T", data.TypeValues)
	}

	switch v := data.Tasks.(type) {
	case []byte:
		if err := json.Unmarshal(v, &tasks); err != nil {
			return nil, err
		}
	case string:
		if err := json.Unmarshal([]byte(v), &tasks); err != nil {
			return nil, err
		}
	case nil:
		// do nothing
	default:
		return nil, fmt.Errorf("expected []byte or string for Tasks, got %T", data.Tasks)
	}

	switch v := data.StepsAndFunnels.(type) {
	case []byte:
		if err := json.Unmarshal(v, &stepsAndFunnels); err != nil {
			fmt.Println("Error: ", err)
			return nil, err
		}
	case string:
		if err := json.Unmarshal([]byte(v), &stepsAndFunnels); err != nil {
			fmt.Println("Error: ", err)
			return nil, err
		}
	case nil:
		// do nothing
	default:
		return nil, fmt.Errorf("expected []byte or string for StepsAndFunnels, got %T", data.StepsAndFunnels)
	}

	switch v := data.Facts.(type) {
	case []byte:
		if err := json.Unmarshal(v, &facts); err != nil {
			return nil, err
		}
	case string:
		if err := json.Unmarshal([]byte(v), &facts); err != nil {
			return nil, err
		}
	case nil:
		// do nothing
	default:
		return nil, fmt.Errorf("expected []byte or string for Facts, got %T", data.Facts)
	}

	// Fetch shared facts from linked objects found in TypeValues
	// REVERTED: User reported that this causes irrelevant facts to appear.
	// Example: Wayfi (linked to Vennluu) shows Vennluu's activities with Art Pro, which is incorrect.
	// Only activities that explicitly link to the current object (Wayfi) should be shown.
	/*
		var linkedObjectIDs []uuid.UUID
		fmt.Printf("DEBUG: Checking TypeValues for Object %s\n", data.ID)
		for _, tv := range typeValues {
			fmt.Printf("DEBUG: TypeValue: %+v\n", tv.TypeValues)
			for key, v := range tv.TypeValues {
				fmt.Printf("DEBUG: Field %s, Value Type: %T, Value: %+v\n", key, v, v)
				// Handle string (deprecated but supported)
				if s, ok := v.(string); ok {
					if id, err := uuid.Parse(s); err == nil {
						linkedObjectIDs = append(linkedObjectIDs, id)
						fmt.Printf("DEBUG: Found linked ID (string): %s\n", id)
					}
				}
				// Handle object {id, name, ...}
				if m, ok := v.(map[string]interface{}); ok {
					if idStr, ok := m["id"].(string); ok {
						if id, err := uuid.Parse(idStr); err == nil {
							linkedObjectIDs = append(linkedObjectIDs, id)
							fmt.Printf("DEBUG: Found linked ID (map): %s\n", id)
						}
					}
				}
				// Handle array of strings or objects
				if arr, ok := v.([]interface{}); ok {
					for _, item := range arr {
						if s, ok := item.(string); ok {
							if id, err := uuid.Parse(s); err == nil {
								linkedObjectIDs = append(linkedObjectIDs, id)
								fmt.Printf("DEBUG: Found linked ID (array-string): %s\n", id)
							}
						}
						if m, ok := item.(map[string]interface{}); ok {
							if idStr, ok := m["id"].(string); ok {
								if id, err := uuid.Parse(idStr); err == nil {
									linkedObjectIDs = append(linkedObjectIDs, id)
									fmt.Printf("DEBUG: Found linked ID (array-map): %s\n", id)
								}
							}
						}
					}
				}
			}
		}
		fmt.Printf("DEBUG: Total Linked Objects: %d\n", len(linkedObjectIDs))

		if len(linkedObjectIDs) > 0 {
			sharedFacts, err := m.DB.GetFactsByObjectIDs(ctx, linkedObjectIDs)
			if err == nil {
				existingFactIDs := make(map[uuid.UUID]bool)
				for _, f := range facts {
					existingFactIDs[f.ID] = true
				}

				for _, dbFact := range sharedFacts {
					if !existingFactIDs[dbFact.ID] {
						facts = append(facts, Fact{
							ID:         dbFact.ID,
							Text:       dbFact.Text,
							HappenedAt: ctype.NullTime{NullTime: dbFact.HappenedAt},
							Location:   dbFact.Location,
							CreatedAt:  dbFact.CreatedAt,
						})
						existingFactIDs[dbFact.ID] = true
					}
				}
			} else {
				fmt.Println("Error fetching shared facts:", err)
			}
		}
	*/

	return &ObjectDetail{
		ID:              data.ID,
		Name:            data.Name,
		Description:     data.Description,
		IDString:        data.IDString,
		CreatorID:       data.CreatorID,
		CreatedAt:       data.CreatedAt,
		Tags:            tags,
		TypeValues:      typeValues,
		Tasks:           tasks,
		StepsAndFunnels: stepsAndFunnels,
		Facts:           facts,
		Aliases:         data.Aliases,
	}, nil
}

func (m *ObjectModel) AddTag(ctx context.Context, objectID, tagID, orgID uuid.UUID) error {
	return m.DB.AddTagToObject(ctx, database.AddTagToObjectParams{
		ObjID: objectID,
		TagID: tagID,
		OrgID: orgID,
	})
}

func (m *ObjectModel) RemoveTag(ctx context.Context, objectID, tagID, orgID uuid.UUID) error {
	return m.DB.RemoveTagFromObject(ctx, database.RemoveTagFromObjectParams{
		ObjID: objectID,
		TagID: tagID,
		OrgID: orgID,
	})
}

func (m *ObjectModel) AddObjectTypeValue(ctx context.Context, objectID, typeID uuid.UUID, values json.RawMessage, orgID uuid.UUID) (*ObjectTypeValue, error) {
	result, err := m.DB.AddObjectTypeValue(ctx, database.AddObjectTypeValueParams{
		ObjID:   objectID,
		TypeID:  typeID,
		Column3: values,
	})
	if err != nil {
		return nil, err
	}
	var parsedValues map[string]interface{}
	err = json.Unmarshal(result.TypeValues, &parsedValues)
	if err != nil {
		return nil, err
	}

	return &ObjectTypeValue{
		ID:           result.ID,
		ObjectTypeID: result.TypeID,
		TypeValues:   parsedValues,
	}, nil
}

func (m *ObjectModel) RemoveObjectTypeValue(ctx context.Context, typeValueID, orgID uuid.UUID) error {
	return m.DB.RemoveObjectTypeValue(ctx, database.RemoveObjectTypeValueParams{
		ID:    typeValueID,
		OrgID: orgID,
	})
}

func (m *ObjectModel) UpdateObjectTypeValue(ctx context.Context, typeValueID, orgID uuid.UUID, values json.RawMessage) (*ObjectTypeValue, error) {
	result, err := m.DB.UpdateObjectTypeValue(ctx, database.UpdateObjectTypeValueParams{
		ID:      typeValueID,
		OrgID:   orgID,
		Column3: values,
	})
	if err != nil {
		return nil, err
	}

	var parsedValues map[string]interface{}
	err = json.Unmarshal(result.TypeValues, &parsedValues)
	if err != nil {
		return nil, err
	}

	return &ObjectTypeValue{
		ID:           result.ID,
		ObjectTypeID: result.TypeID,
		TypeValues:   parsedValues,
	}, nil
}

type ObjStep struct {
	ID        uuid.UUID
	ObjID     uuid.UUID
	StepID    uuid.UUID
	CreatorID uuid.UUID
	CreatedAt time.Time
	DeletedAt ctype.NullTime
}

func (m *ObjectModel) CreateObjStep(ctx context.Context, objID, stepID, creatorID uuid.UUID) (*ObjStep, error) {
	row, err := m.DB.CreateObjStep(ctx, database.CreateObjStepParams{
		ObjID:     objID,
		StepID:    stepID,
		CreatorID: creatorID,
	})
	if err != nil {
		return nil, err
	}

	return &ObjStep{
		ID:        row.ID,
		ObjID:     row.ObjID,
		StepID:    row.StepID,
		CreatorID: row.CreatorID,
		CreatedAt: row.CreatedAt,
		DeletedAt: ctype.NullTime{
			NullTime: row.DeletedAt,
		},
	}, nil
}

func (m *ObjectModel) SoftDeleteObjStep(ctx context.Context, id uuid.UUID) error {
	return m.DB.SoftDeleteObjStep(ctx, id)
}

func (m *ObjectModel) HardDeleteObjStep(ctx context.Context, id uuid.UUID) error {
	return m.DB.HardDeleteObjStep(ctx, id)
}

type ObjStepResponse struct {
	ID         uuid.UUID `json:"id"`
	ObjID      uuid.UUID `json:"objId"`
	StepID     uuid.UUID `json:"stepId"`
	CreatorID  uuid.UUID `json:"creatorId"`
	CreatedAt  time.Time `json:"createdAt"`
	StepName   string    `json:"stepName"`
	FunnelName string    `json:"funnelName"`
}

func (m *ObjectModel) GetObjStep(ctx context.Context, id uuid.UUID) (*ObjStepResponse, error) {
	row, err := m.DB.GetObjStep(ctx, id)
	if err != nil {
		return nil, err
	}
	stepDetail, err := m.DB.GetStep(ctx, row.ID)
	if err != nil {
		return nil, err
	}

	return &ObjStepResponse{
		ID:         row.ID,
		ObjID:      row.ObjID,
		StepID:     row.StepID,
		CreatorID:  row.CreatorID,
		CreatedAt:  row.CreatedAt,
		StepName:   stepDetail.Name,
		FunnelName: stepDetail.FunnelName,
	}, nil
}

func (m *ObjectModel) UpdateObjStepSubStatus(ctx context.Context, id uuid.UUID, subStatus int32) error {
	return m.DB.UpdateObjStepSubStatus(ctx, database.UpdateObjStepSubStatusParams{
		ID:        id,
		SubStatus: subStatus,
	})
}
