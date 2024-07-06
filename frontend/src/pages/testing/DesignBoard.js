import { Spacer } from "@geist-ui/core";
import { Settings } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Form, FormFieldWrapper } from "../../components/ui/form";

function Box({ children, className }) {
  return <div className={`p-4 border ${className}`}>{children}</div>;
}

export default function DesignBoard() {
  const form = useForm();
  const otpForm = useForm();
  const [formData, setFormData] = useState({});
  const [otpFormData, setOtpFormData] = useState({});

  const onSubmit = (data) => {
    setFormData(data);
    console.log("SUBMITTED : ", data);
  };

  const onOtpSubmit = (data) => {
    setOtpFormData(data);
    console.log("OTP SUBMITTED : ", data);
  };

  const onReset = (e) => {
    e.preventDefault();
    try {
      form.reset();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-4 my-20">
      <div className="flex flex-col xl:grid xl:grid-cols-3">
        {/* colors */}
        <Box className="lg:start-0 lg:col-span-3">
          <div className="grid grid-cols-1 lg:grid-cols-7">
            <div className="flex-center text-center text-y-white h-20 lg:h-40 bg-y-black">
              bg-y-black <br /> #060000ff
            </div>
            <div className="flex-center text-center text-y-white h-20 lg:h-40 bg-y-grey">
              bg-y-grey <br /> #383838ff
            </div>
            <div className="flex-center text-center text-y-white h-20 lg:h-40 bg-y-darkgreen">
              bg-y-darkgreen <br /> #395b50ff
            </div>
            <div className="flex-center text-center text-y-white h-20 lg:h-40 bg-y-green">
              bg-y-green <br /> #87a878ff
            </div>
            <div className="flex-center text-center text-y-white h-20 lg:h-40 bg-y-red">
              bg-y-red <br /> #ecebebff
            </div>
            <div className="flex-center text-center text-y-white h-20 lg:h-40 bg-y-brown">
              bg-y-brown <br /> #5c5346ff
            </div>
            <div className="flex-center text-center text-y-black h-20 lg:h-40 bg-y-white">
              bg-y-white <br /> #BF8B85ff
            </div>
          </div>
        </Box>

        {/* headings and text */}
        <Box>
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </p>
          <p className="y-underline-black">
            Underlined text; Use `y-underline-black` class.
          </p>
          <p className="y-underline-white">
            Underlined text; Use `y-underline-white` class.
          </p>
          <p className="y-underline-green">
            Underlined text; Use `y-underline-green` class.
          </p>
          <p className="y-underline-darkgreen">
            Underlined text; Use `y-underline-darkgreen` class.
          </p>
          <p className="italic">Italiciced text</p>
        </Box>
        <Box className="start-1 col-span-2">
          <h1 className="text-step-12">Step 12</h1>
          <h1 className="text-step-11">Step 11</h1>
          <h1 className="text-step-10">Step 10</h1>
          <h1 className="text-step-9">Step 9</h1>
          <h1 className="text-step-8">Step 8</h1>
          <h1 className="text-step-7">Step 7</h1>
          <h1 className="text-step-6">Step 6</h1>
          <h1 className="text-step-5">Step 5</h1>
          <h1 className="text-step-4">Step 4</h1>
          <h1 className="text-step-3">Step 3</h1>
          <h1 className="text-step-2">Step 2</h1>
          <h1 className="text-step-1">Step 1</h1>
          <h1 className="text-step-0">Step 0</h1>
          <h1 className="text-step--1">Step -1</h1>
          <h1 className="text-step--2">Step -2</h1>
        </Box>

        {/* buttons */}
        <Box className="lg:col-start-0 lg:col-span-2">
          <div className="flex lg:flex-row flex-col gap-2">
            <Button variant="default">Default (default)</Button>
            <Button variant="default" size="lg">
              Default (lg)
            </Button>
            <Button variant="default" size="sm">
              Default (sm)
            </Button>
            <Button variant="default" size="icon">
              <Settings />
            </Button>
          </div>
          <Spacer y={1} />
          <div className="flex lg:flex-row flex-col gap-2">
            <Button variant="secondary">secondary (default)</Button>
            <Button variant="secondary" size="lg">
              secondary (lg)
            </Button>
            <Button variant="secondary" size="sm">
              secondary (sm)
            </Button>
            <Button variant="secondary" size="icon">
              <Settings />
            </Button>
          </div>
          <Spacer y={1} />
          <div className="flex lg:flex-row flex-col gap-2">
            <Button variant="outline">outline (default)</Button>
            <Button variant="outline" size="lg">
              outline (lg)
            </Button>
            <Button variant="outline" size="sm">
              outline (sm)
            </Button>
            <Button variant="outline" size="icon">
              <Settings />
            </Button>
          </div>
          <Spacer y={1} />
          <div className="flex lg:flex-row flex-col gap-2">
            <Button variant="ghost">ghost (default)</Button>
            <Button variant="ghost" size="lg">
              ghost (lg)
            </Button>
            <Button variant="ghost" size="sm">
              ghost (sm)
            </Button>
            <Button variant="ghost" size="icon">
              <Settings />
            </Button>
          </div>
          <Spacer y={1} />
          <div className="flex lg:flex-row flex-col gap-2">
            <Button variant="destructive">destructive (default)</Button>
            <Button variant="destructive" size="lg">
              destructive (lg)
            </Button>
            <Button variant="destructive" size="sm">
              destructive (sm)
            </Button>
            <Button variant="destructive" size="icon">
              <Settings />
            </Button>
          </div>
          <Spacer y={1} />
          <div className="flex lg:flex-row flex-col gap-2">
            <Button variant="experiment">experiment (default)</Button>
            <Button variant="experiment" size="lg">
              experiment (lg)
            </Button>
            <Button variant="experiment" size="sm">
              experiment (sm)
            </Button>
            <Button variant="experiment" size="icon">
              <Settings />
            </Button>
          </div>
          <Spacer y={1} />
          <div className="flex lg:flex-row flex-col gap-2">
            <Button variant="experiment" loading={true}>
              loading
            </Button>
            <Button variant="experiment" size="lg" loading={true}>
              loading
            </Button>
            <Button variant="experiment" size="sm" loading={true}>
              loading
            </Button>
            <Button variant="experiment" size="icon" loading={true}>
              <Settings />
            </Button>
          </div>
          <Spacer y={1} />
          <div className="flex lg:flex-row flex-col gap-2">
            <Button variant="experiment" disabled={true}>
              disabled
            </Button>
            <Button variant="experiment" size="lg" disabled={true}>
              disabled
            </Button>
            <Button variant="experiment" size="sm" disabled={true}>
              disabled
            </Button>
            <Button variant="experiment" size="icon" disabled={true}>
              <Settings />
            </Button>
          </div>
          <Spacer y={1} />
          <div className="flex lg:flex-row flex-col gap-2">
            <Button variant="dark">dark (default)</Button>
            <Button variant="dark" size="lg">
              dark (lg)
            </Button>
            <Button variant="dark" size="sm">
              dark (sm)
            </Button>
            <Button variant="dark" size="icon">
              <Settings />
            </Button>
          </div>
        </Box>

        {/* card */}
        <Box className="">
          <Card variant="primary">
            <CardHeader>
              <CardTitle>primary Card</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="experiment" className="w-full" size="sm">
                Buy
              </Button>
              <Button variant="ghost" className="w-full" size="sm">
                Cancel
              </Button>
            </CardFooter>
          </Card>
          <Spacer y={1} />
          <Card variant="secondary">
            <CardHeader>
              <CardTitle>secondary Card</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="experiment" className="w-full" size="sm">
                Buy
              </Button>
              <Button variant="ghost" className="w-full" size="sm">
                Cancel
              </Button>
            </CardFooter>
          </Card>
          <Spacer y={1} />
          <Card variant="success">
            <CardHeader>
              <CardTitle>success Card</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="experiment" className="w-full" size="sm">
                Buy
              </Button>
              <Button variant="destructive" className="w-full" size="sm">
                Cancel
              </Button>
            </CardFooter>
          </Card>
          <Spacer y={1} />
          <Card variant="success-alt">
            <CardHeader>
              <CardTitle>success-alt Card</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="dark" className="w-full" size="sm">
                Buy
              </Button>
              <Button variant="destructive" className="w-full" size="sm">
                Cancel
              </Button>
            </CardFooter>
          </Card>
          <Spacer y={1} />
          <Card variant="destructive">
            <CardHeader>
              <CardTitle>destructive Card</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="dark" className="w-full" size="sm">
                Buy
              </Button>
              <Button variant="destructive" className="w-full" size="sm">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </Box>

        <Box>
          <h1>Form Data</h1>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
          <Spacer y={1} />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormFieldWrapper
                form={form}
                type="text"
                name="username"
                label="Username"
                defaultValue="Default Value Test"
              />
              <FormFieldWrapper
                form={form}
                type="email"
                name="email"
                label="Email"
              />
              <FormFieldWrapper
                form={form}
                type="email"
                name="disabled"
                label="Disabled"
                disabled={true}
              />
              <FormFieldWrapper
                form={form}
                type="datetime-local"
                name="dob"
                label="Date of Birth"
              />
              <div className="flex items-end gap-4 w-full">
                <FormFieldWrapper
                  form={form}
                  type="password"
                  name="password"
                  label="Password"
                  className="flex-1 flex-shrink-0"
                />
                {/* <Button
									variant="ghost"
									size="lg"
									onClick={(e) => {
										e.preventDefault();

										try {
											console.log("resetting password");
											form.reset({
												password: "",
											});
										} catch (err) {
											console.log(err);
										}
									}}>
									Reset
								</Button> */}
              </div>
              <Button variant="experiment" htmlType="submit">
                Submit
              </Button>
              <Button variant="ghost" htmlType="reset" onClick={onReset}>
                Reset
              </Button>
            </form>
          </Form>
        </Box>

        <Box>
          <Accordion collapsible type="single">
            <AccordionItem value="item-1">
              <AccordionTrigger>Item 1</AccordionTrigger>
              <AccordionContent>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book. It has
                survived not only five centuries, but also the leap into
                electronic typesetting, remaining essentially unchanged. It was
                popularised in the 1960s with the release of Letraset sheets
                containing Lorem Ipsum passages, and more recently with desktop
                publishing software like Aldus PageMaker including versions of
                Lorem Ipsum.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Item 2</AccordionTrigger>
              <AccordionContent>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book. It has
                survived not only five centuries, but also the leap into
                electronic typesetting, remaining essentially unchanged. It was
                popularised in the 1960s with the release of Letraset sheets
                containing Lorem Ipsum passages, and more recently with desktop
                publishing software like Aldus PageMaker including versions of
                Lorem Ipsum.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Item 3</AccordionTrigger>
              <AccordionContent>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book. It has
                survived not only five centuries, but also the leap into
                electronic typesetting, remaining essentially unchanged. It was
                popularised in the 1960s with the release of Letraset sheets
                containing Lorem Ipsum passages, and more recently with desktop
                publishing software like Aldus PageMaker including versions of
                Lorem Ipsum.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Box>

        <Box>
          <Card>
            <CardHeader>
              <CardTitle>Phone Auth</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...otpForm}>
                <form className="py-4 w-full flex flex-col gap-4">
                  <FormFieldWrapper
                    label="Enter OTP sent to +91 9999999999"
                    name="otp"
                    type="otp"
                    className="w-full"
                  />
                  <Button
                    variant="experiment"
                    onClick={otpForm.handleSubmit(onOtpSubmit)}
                  >
                    Submit
                  </Button>
                </form>
              </Form>
              <Button
                variant="ghost"
                htmlType="submit"
                className="w-full"
                onClick={() => {}}
              >
                Resend OTP
              </Button>
            </CardContent>
          </Card>
        </Box>
      </div>
    </div>
  );
}
