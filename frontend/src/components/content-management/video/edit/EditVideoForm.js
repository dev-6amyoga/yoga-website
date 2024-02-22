import { Button, Description, Input, Select, Text } from '@geist-ui/core'

function EditVideoForm({
    modalData,
    editAsanaFormRef,
    handleInputChange,
    handleSelect,
    tableLanguages,
    categories,
    asana,
    dirty,
    setDirty,
    updateData,
    loading,
    resetChanges,
}) {
    return (
        <div className="rounded-lg border p-4">
            <form className="flex flex-row gap-4" ref={editAsanaFormRef}>
                <div className="flex-1 flex flex-col gap-3">
                    <Description title="Asana Details" />
                    <Text small type="secondary">
                        <Text span>Asana ID: </Text>
                        {asana.id}
                    </Text>
                    <Input
                        width="100%"
                        id="asana_name"
                        placeholder={modalData.asana_name}
                        onChange={handleInputChange}
                    >
                        Asana Name
                    </Input>

                    <Input
                        width="100%"
                        id="asana_desc"
                        placeholder={modalData.asana_desc}
                        onChange={handleInputChange}
                    >
                        Description
                    </Input>

                    <Input
                        width="100%"
                        id="asana_videoID"
                        placeholder={modalData.asana_videoID}
                        onChange={handleInputChange}
                    >
                        Video ID
                    </Input>

                    <Input
                        width="100%"
                        id="asana_hls_url"
                        placeholder={modalData.asana_hls_url}
                        onChange={handleInputChange}
                    >
                        HLS Url
                    </Input>

                    <Input
                        width="100%"
                        id="asana_dash_url"
                        placeholder={modalData.asana_dash_url}
                        onChange={handleInputChange}
                    >
                        DASH Url
                    </Input>

                    <div className="grid grid-cols-4">
                        <div>
                            <Text p>Language</Text>
                            <Select
                                onChange={(val) =>
                                    handleSelect(val, 'language')
                                }
                                value={modalData.language}
                            >
                                {tableLanguages &&
                                    tableLanguages.map((language) => (
                                        <Select.Option
                                            key={language.language_id}
                                            value={language.language}
                                        >
                                            {language.language}
                                        </Select.Option>
                                    ))}
                            </Select>
                        </div>

                        <div>
                            <Text p>Video Type</Text>
                            <Select
                                onChange={(val) =>
                                    handleSelect(val, 'asana_type')
                                }
                                value={modalData.asana_type}
                            >
                                <Select.Option value="Single">
                                    Single
                                </Select.Option>
                                <Select.Option value="Combination">
                                    Combination
                                </Select.Option>
                            </Select>
                        </div>

                        <div>
                            <Text p>Asana Difficulty</Text>
                            <Select
                                onChange={(val) =>
                                    handleSelect(val, 'asana_difficulty')
                                }
                                value={modalData.asana_difficulty}
                            >
                                <Select.Option value="Beginner">
                                    Beginner
                                </Select.Option>
                                <Select.Option value="Intermediate">
                                    Intermediate
                                </Select.Option>
                                <Select.Option value="Advanced">
                                    Advanced
                                </Select.Option>
                            </Select>
                        </div>

                        <div>
                            <Text p>Category</Text>
                            <Select
                                onChange={(val) =>
                                    handleSelect(val, 'asana_category')
                                }
                                value={modalData.asana_category}
                            >
                                {categories &&
                                    categories.map((x) => (
                                        <Select.Option
                                            key={x.asana_category_id}
                                            value={x.asana_category}
                                        >
                                            {x.asana_category}
                                        </Select.Option>
                                    ))}
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Description title="Actions" />
                    {dirty ? (
                        <Button
                            scale={0.8}
                            type="secondary"
                            onClick={(e) => {
                                e.preventDefault()
                                resetChanges()
                            }}
                        >
                            Reset Changes
                        </Button>
                    ) : (
                        <></>
                    )}
                    <Button
                        scale={0.8}
                        type="warning"
                        onClick={(e) => {
                            e.preventDefault()
                            if (dirty) {
                                updateData()
                            } else {
                                setDirty(true)
                            }
                        }}
                        loading={loading}
                    >
                        {dirty ? 'Save Changes' : 'Edit'}
                    </Button>
                    <Button
                        scale={0.8}
                        type="error"
                        onClick={(e) => {
                            e.preventDefault()
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default EditVideoForm
