import { type NextPage } from 'next'
import Head from 'next/head'
import { env } from '~/env.mjs'
import { DropzoneS3Upload } from '~/components/Upload_S3'
import dynamic from 'next/dynamic'

import {
  // Textarea,
  Card,
  Image,
  Text,
  Title,
  Badge,
  MantineProvider,
  Button,
  Group,
  Stack,
  createStyles,
  FileInput,
  rem,
} from '@mantine/core'

import { IconUpload } from '@tabler/icons-react'
import { api } from '~/utils/api'

import React, { useState, useEffect } from 'react'
import axios, { AxiosResponse } from 'axios'
import { createClient } from '@supabase/supabase-js'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'

// trying to do supabase connection on edge function.
// export const config = {
//     runtime: 'experimental-edge', // this is a pre-requisite
//   };

// run on server side
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { params } = context
  if (!params) {
    return {
      course_data: null,
      course_name: null,
    }
  }
  console.log('params ----------------------', params)
  const course_name = params['dynamic_course']

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET)
  async function checkCourseExists() {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('name', course_name)
      .single()

    if (!data) {
      console.log('Course not found ☹️')
    } else {
      console.log('Course found 😍')
    }
    return data
  }

  const course_data = await checkCourseExists()
  console.log('course_data')
  console.log(course_data)
  return {
    props: {
      course_data,
      course_name,
    },
  }
}

interface CourseMainProps {
  course_data: any
  course_name: string
}

// run on client side
const CourseMain: NextPage<CourseMainProps> = (props) => {
  console.log('PROPS IN COURSE_MAIN', props)
  const course_name = props.course_name
  const currentPageName = GetCurrentPageName()

  // MAKE A NEW COURSE PAGE
  if (props.course_data == null) {
    return (
      <>
        <Head>
          <title>{currentPageName}</title>
          <meta
            name="description"
            content="The AI teaching assistant built for students at UIUC."
          />
          <link rel="icon" href="/favicon.ico" />
          {/* <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lora"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Audiowide"/> */}
        </Head>

        <main className="items-left justify-left; course-page-main flex min-h-screen flex-col">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
            <Link href="/">
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                UIUC Course <span className="text-[hsl(280,100%,70%)]">AI</span>
              </h1>
            </Link>
          </div>
          <div className="items-left container flex flex-col justify-center gap-12 px-20 py-16 ">
            <h2 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              Course does not exist,{' '}
              <span className="text-[hsl(280,100%,70%)]">&nbsp;yet!</span>
            </h2>
            <Title order={2}></Title>
            <Flex direction="column" align="center" justify="center">
              <Title style={{ color: 'White' }} order={3} p="md">
                To create course, simply upload your course materials and on
                will be created for you!
              </Title>
              <Title style={{ color: 'White' }} order={3} variant="normal">
                The course will be named:
              </Title>
              <Title
                style={{ color: 'White' }}
                order={2}
                p="md"
                variant="gradient"
                weight="bold"
                gradient={{ from: 'gold', to: 'white', deg: 140 }}
              >
                {props.course_name}
              </Title>
              <DropzoneS3Upload course_name={props.course_name} />
            </Flex>
          </div>
        </main>
      </>
    )
  }

  // COURSE PAGE
  return (
    <>
      <Head>
        <title>{currentPageName}</title>
        <meta
          name="description"
          content="The AI teaching assistant built for students at UIUC."
        />
        <link rel="icon" href="/favicon.ico" />
        {/* <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lora"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Audiowide"/> */}
      </Head>

      <main className="items-left justify-left; course-page-main flex min-h-screen flex-col">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <Link href="/">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              UIUC Course <span className="text-[hsl(280,100%,70%)]">AI</span>
            </h1>
          </Link>
        </div>
        <div className="items-left container flex flex-col justify-center gap-12 px-20 py-16 ">
          <h2 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            UIUC{' '}
            <span className="text-[hsl(280,100%,70%)]">{currentPageName}</span>
          </h2>
          <Text style={{ fontFamily: 'Montserrat' }} size="md" color="white">
            Taught by{' '}
            <Text style={{ display: 'inline' }} color="skyblue">
              Prof. Volodymyr (Vlad) Kindratenko
            </Text>
            , Director of the Center for Artificial Intelligence Innovation at
            NCSA, in{' '}
            <Text style={{ display: 'inline' }} color="skyblue">
              Spring 2022
            </Text>
            .
          </Text>
        </div>

        {/* CHATBOT CONTAINER */}
        {/* style={{border: '1px solid white', borderRadius: '10px'}} */}
        <Container size="xl" px="md" py="md">
          <AShortChat />
          <InputWithButton pb="md" />
          <ChatSettings />
        </Container>

        {/* MAIN WEEKLY CONTENT */}
        <Container size="xl" px="md" py="md">
          <Title order={2}>Course Overview</Title>
          <Flex
            mih={50}
            // bg="rgba(0, 0, 0, .3)"
            justify="flex-start"
            align="flex-start"
            direction="row"
            wrap="wrap"
          >
            <div className="item">
              <MaterialsCard />
            </div>
            <div className="item">
              <MaterialsCard />
            </div>
            <div className="item">
              <MaterialsCard />
            </div>
            <div className="item-wide">
              <DropzoneS3Upload course_name={course_name} />
            </div>
          </Flex>

          <Title order={2}>Week 1: Finite State Machines</Title>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <DropzoneS3Upload course_name={course_name} />
          </div>
          <Title order={2}>Week 2: Circuit Diagrams</Title>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <DropzoneS3Upload course_name={course_name} />
          </div>
          <Title order={2}>Week 3: LC-3 ISA</Title>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <DropzoneS3Upload course_name={course_name} />
          </div>

          <TextInput
            placeholder="Add another content section here! (testing different ways of making the titles editable by the professors)"
            variant="unstyled"
            size="xl"
            withAsterisk
          />
        </Container>

        <BuildContextCards />
      </main>
    </>
  )
}
export default CourseMain

import {
  Switch,
  Flex,
  Container,
  TextInput,
  TextInputProps,
  ActionIcon,
  useMantineTheme,
  Checkbox,
} from '@mantine/core'
import {
  IconSearch,
  IconArrowRight,
  IconArrowLeft,
  IconExternalLink,
} from '@tabler/icons-react'
import { useListState, randomId } from '@mantine/hooks'
// import { useRef } from 'react'
// import { Dropzone, MIME_TYPES } from '@mantine/dropzone'
import Link from 'next/link'
// import { UploadDropzone } from '@uploadthing/react'
// import { Interface } from 'readline'

import { fetchContexts, getTopContextsResponse } from './api/getContexts'

/// START OF COMPONENTS
import { useRouter } from 'next/router'
export const GetCurrentPageName = () => {
  return useRouter().asPath.slice(1)
}


export const BuildContextCards = () => {
  const [contexts, setContexts] = useState<getTopContextsResponse[]>();

  useEffect(() => {
    fetchContexts().then((data) => {
      setContexts(data);
    });
  }, []);

  return (
    <>
      {contexts ? (
        contexts.map((context: getTopContextsResponse, index: number) => (
          <DynamicMaterialsCard
            key={context.id || index}
            id={context.id || index} // Add fallback key using index. Not sure why we need a key and an ID.... bad code.
            source_name={context.source_name}
            source_location={context.source_location}
            text={context.text}
          />
        ))
      ) : (
        // <p>Loading...</p>

        <div role="status" className="max-w-sm p-4 border border-gray-200 rounded shadow animate-pulse md:p-6 dark:border-gray-700">
            <div className="flex items-center justify-center h-48 mb-4 bg-gray-300 rounded dark:bg-gray-700">
                <svg className="w-12 h-12 text-gray-200 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 640 512"><path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"/></svg>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <div className="flex items-center mt-4 space-x-3">
                <svg className="text-gray-200 w-14 h-14 dark:text-gray-700" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path></svg>
                <div>
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                    <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                </div>
            </div>
            <span className="sr-only">Loading...</span>
        </div>

      )}
    </>
  );
};

function DynamicMaterialsCard({ source_name, source_location, text }: getTopContextsResponse) {
  return (
    <div className="box-sizing: border-box; border: 100px solid #ccc;">
      <Card
        bg="#0E1116"
        style={{ maxWidth: '20rem' }}
        shadow="sm"
        padding="md"
        radius="md"
        withBorder
      >
        <Card.Section>
          <Image
            src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80"
            height={'7rem'}
            alt="Norway"
          />
        </Card.Section>

        <Group position="apart" mt="xs" mb="xs">
          <Text style={{ fontFamily: 'Montserrat' }} size="md" weight={600}>
            {source_name}
          </Text>
        </Group>

        <Link
          href={'https://kastanday.com'}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Group>
            {/* <IconExternalLink size={20} strokeWidth={2} color={'white'} /> */}
            <Text
              size="xs"
              variant="dimmed"
              weight={4300}
              // gradient={{ from: 'yellow', to: 'green', deg: 0 }}
            >
              {/* Source {source_location} */}
              Page 11
            </Text>
          </Group>
        </Link>

        <Text
          size="sm"
          variant="gradient"
          weight={600}
          gradient={{ from: 'yellow', to: 'green', deg: 0 }}
        >
          AI summary
        </Text>
        <Text className="fade" size="md" color="dimmed">
          {text}
        </Text>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="xs" variant="dimmed" pb="0">
            Show full paragraph
          </Button>
        </div>
      </Card>
    </div>
  )
}

const initialValues = [
  { label: 'Week 1: Finite State Machines', checked: true, key: randomId() },
  { label: 'Week 2: Circuit Diagrams', checked: true, key: randomId() },
  { label: 'Week 3: LC-3 ISA', checked: true, key: randomId() },
]

export function IndeterminateCheckbox() {
  const [values, handlers] = useListState(initialValues)

  const allChecked = values.every((value) => value.checked)
  const indeterminate = values.some((value) => value.checked) && !allChecked

  const items = values.map((value, index) => (
    <Checkbox
      mt="xs"
      ml={33}
      color="cyan"
      label={value.label}
      key={value.key}
      checked={value.checked}
      onChange={(event) =>
        handlers.setItemProp(index, 'checked', event.currentTarget.checked)
      }
    />
  ))

  return (
    <>
      <Text
        size="lg"
        pb=".2rem"
        weight={700}
        variant="gradient"
        gradient={{ from: 'cyan', to: 'indigo', deg: 0 }}
      >
        Optionally refine your search space
      </Text>
      <Checkbox
        checked={allChecked}
        indeterminate={indeterminate}
        label="Include content from all weeks"
        color="cyan"
        transitionDuration={0}
        onChange={() =>
          handlers.setState((current) =>
            current.map((value) => ({ ...value, checked: !allChecked })),
          )
        }
      />
      {items}
    </>
  )
}

function ChatSettings() {
  return (
    <div>
      <Flex
        mih={50}
        // bg="rgba(0, 0, 0, .3)"
        gap="sm"
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="wrap"
      >
        <PublicChatSwitch />
        <GPT4Switch />
      </Flex>
      <IndeterminateCheckbox />
    </div>
  )
}

function AShortChat() {
  return (
    <Container size="lg" px="md" py="md">
      <div className="chat chat-end">
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
          </div>
        </div>
        <div className="chat-header">
          Anakin
          <time className="text-xs opacity-50"> 12:46</time>
        </div>
        <div className="chat-bubble">What is a Finite State machine?</div>
        <div className="chat-footer opacity-50">Seen at 12:46</div>
      </div>

      <div className="chat chat-start">
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img
              className="mask mask-hexagon-2"
              src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            />
          </div>
        </div>
        <div className="chat-header">
          Obi-Wan Kenobi
          <time className="text-xs opacity-50">12:46</time>
        </div>
        <div className="chat-bubble to-blue-600">
          A Finite State Machine (FSM) is a mathematical model used to represent
          and analyze systems that can be in a finite number of states and can
          transition between these states in response to external inputs. It is
          also known as a Finite Automaton or a State Transition System.
        </div>
        <div className="chat-footer to-blue-600 opacity-50 ">Delivered</div>
      </div>
      <Text size="lg" weight={800} p={6}>
        From the course
      </Text>
      <Group variant="row" spacing="xs">
        {/* <MaterialsCard /> */}
        {/* <MaterialsCard /> */}
        <MaterialsCardSmall />
        <MaterialsCardSmall />
      </Group>

      <div className="chat chat-end">
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
          </div>
        </div>
        <div className="chat-header">
          Anakin
          <time className="text-xs opacity-50"> 12:47</time>
        </div>
        <div className="chat-bubble">Why are they useful??</div>
        <div className="chat-footer opacity-50">Seen at 12:47</div>
      </div>
    </Container>
  )
}

function PublicChatSwitch() {
  return (
    <Switch
      label="Share chat publicly"
      description="Chat history appears on your profile"
      color="cyan"
    />
  )
}
function GPT4Switch() {
  return (
    <Switch
      label="Use GPT-4 (instead of 3.5)"
      description="Best for extremely long contexts "
      color="cyan"
    />
  )
}

export function InputWithButton(props: TextInputProps) {
  const theme = useMantineTheme()

  return (
    <TextInput
      icon={<IconSearch size="1.1rem" stroke={1.5} />}
      radius="xl"
      size="md"
      rightSection={
        <ActionIcon
          size={32}
          radius="xl"
          color={theme.primaryColor}
          variant="filled"
        >
          {theme.dir === 'ltr' ? (
            <IconArrowRight size="1.1rem" stroke={1.5} />
          ) : (
            <IconArrowLeft size="1.1rem" stroke={1.5} />
          )}
        </ActionIcon>
      }
      placeholder="Search questions"
      rightSectionWidth={42}
      {...props}
    />
  )
}

function MaterialsCard() {
  return (
    <div className="box-sizing: border-box; border: 100px solid #ccc;">
      <Card
        bg="#0E1116"
        style={{ maxWidth: '100%' }}
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
      >
        <Card.Section>
          <Image
            src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80"
            height={160}
            alt="Norway"
          />
        </Card.Section>

        <Group position="apart" mt="md" mb="xs">
          <Text style={{ fontFamily: 'Montserrat' }} size="xl" weight={800}>
            Finite State Machine Readings
          </Text>
          <Badge size="xl" color="pink" variant="light">
            ECE
          </Badge>
        </Group>

        <Text size="sm" color="dimmed">
          Crucial for any learning endeavour.
        </Text>

        <Button variant="light" color="blue" fullWidth mt="md" radius="md">
          View
        </Button>
      </Card>
    </div>
  )
}

// In the chat box
function MaterialsCardSmall() {
  return (
    <div className="box-sizing: border-box; border: 100px solid #ccc;">
      <Card
        bg="#0E1116"
        style={{ maxWidth: '20rem' }}
        shadow="sm"
        padding="md"
        radius="md"
        withBorder
      >
        <Card.Section>
          <Image
            src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80"
            height={'7rem'}
            alt="Norway"
          />
        </Card.Section>

        <Group position="apart" mt="md" mb="xs">
          <Text style={{ fontFamily: 'Montserrat' }} size="xl" weight={800}>
            Finite State Machine Readings
          </Text>
          {/* <Badge size="xl" color="pink" variant="light">
          ECE
        </Badge> */}
        </Group>

        <Text
          size="sm"
          variant="gradient"
          weight={600}
          gradient={{ from: 'yellow', to: 'green', deg: 0 }}
        >
          AI summary
        </Text>
        {/* style={{'font-family': 'Lora'}} */}
        <Text className="fade" size="md" color="dimmed">
          In a FSM, each state represents a specific condition or mode that the
          system can be in, and each transition represents a change of state
          triggered by a specific input or event. The FSM can be defined by a
          set of states, a set of input symbols or events, a set of output
          symbols or actions, and a transition function that maps each state and
          input to a next state and output.
        </Text>
        {/* <Button size="xs" variant="dimmed">Show full paragraph</Button> */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="xs" variant="dimmed" pb="0">
            Show full paragraph
          </Button>
        </div>
      </Card>
    </div>
  )
}