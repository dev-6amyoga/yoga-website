import { Tabs, Input, Button } from "@geist-ui/core";
import InstituteNavbar from "../../../components/Common/InstituteNavbar/InstituteNavbar";

export default function AddNewTeacher() {
  const handleSubmit = async (e) => {
    e.preventDefault();
  };
  return (
    <div>
      <div>
        <InstituteNavbar />
      </div>
      <div className="max-w-5xl mx-auto">
        <form className="flex flex-col gap-2 my-8" onSubmit={handleSubmit}>
          <Input width="100%" placeholder="John Doe" name="teacher_name">
            Teacher Name
          </Input>
          <Input
            width="100%"
            placeholder="teacher@gmail.com"
            name="teacher_email"
          >
            Teacher Email ID
          </Input>
          <Input width="100%" placeholder="9876543210" name="teacher_phone">
            Teacher Phone Number
          </Input>
          <div className="flex flex-row gap-2 w-full">
            <Button className="flex-1" type="secondary" htmlType="submit">
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
