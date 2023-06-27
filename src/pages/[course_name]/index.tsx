import { GetServerSidePropsContext } from 'next' // GetServerSideProps, GetServerSideProps,
import { NextPage } from 'next'
import MakeNewCoursePage from '~/components/UIUC-Components/MakeNewCoursePage'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Text } from '@mantine/core'
import { kv } from '@vercel/kv'
import { CourseMetadata } from '~/types/courseMetadata'
import { useAuth, useUser } from '@clerk/nextjs'
// import { CannotEditCourse } from '~/components/UIUC-Components/CannotEditCourse'
import { LoadingSpinner } from '~/components/UIUC-Components/LoadingSpinner'
import { CannotViewCourse } from '~/components/UIUC-Components/CannotViewCourse'
import { get_user_permission } from '~/components/UIUC-Components/runAuthCheck'

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { params } = context
  if (!params) {
    return {
      course_name: null,
      course_exists: null,
      course_metadata: null,
    }
  }

  const course_name = params['course_name'] as string

  // const course_exists = await kv.get(course_name) // kv.get() only works server-side. Otherwise use fetch.
  const course_metadata: CourseMetadata | null = await kv.get(
    course_name + '_metadata',
  )

  if (course_metadata != null) {
    console.log('course_metadata', course_metadata)
    return {
      props: {
        course_name,
        course_exists: true,
        course_metadata,
      },
    }
  }

  console.log('index.tsx - metadata', course_metadata)
  // console.log(
  //   'approved_emails_list',
  //   course_metadata?.['approved_emails_list'] ?? [],
  // )

  return {
    props: {
      course_name,
      course_exists: false,
      course_metadata,
    },
  }
}

interface CourseMainProps {
  course_name: string
  course_exists: boolean
  course_metadata: CourseMetadata
}

const IfCourseExists: NextPage<CourseMainProps> = (props) => {
  console.log('PROPS IN COURSE_MAIN index.tsx', props)
  const course_name = props.course_name as string
  const course_exists = props.course_exists as boolean
  const course_metadata = props.course_metadata as CourseMetadata

  const router = useRouter()

  const clerk_user_outer = useUser()

  // DO AUTH-based redirect!
  useEffect(() => {
    if (clerk_user_outer.isLoaded) {
      if (course_exists) {
        const permission_str = get_user_permission(
          course_metadata,
          clerk_user_outer,
          router,
        )

        if (permission_str == 'edit' || permission_str == 'view') {
          // ✅ AUTHED
          console.log(
            'Course exists & user is properly authed, redirecting to gpt4 page',
          )
          router.push(`/${course_name}/gpt4`)
        } else {
          // 🚫 NOT AUTHED
          router.push(`/${course_name}/not_authorized`)
        }
      } else {
        // 🆕 MAKE A NEW COURSE
        console.log('Course does not exist, redirecting to materials page')
        router.push(`/${course_name}/materials`)
      }
    }
  }, [clerk_user_outer, course_exists])

  // here we redirect depending on Auth.
  return (
    <>
      {course_exists ? (
        <main className="items-left justify-left; course-page-main flex min-h-screen flex-col">
          <div className="container flex flex-col items-center justify-center px-4 py-16 ">
            <Text weight={800}>Checking if course exists...</Text>
            <br></br>
            <br></br>
            <LoadingSpinner />
          </div>
        </main>
      ) : (
        <MakeNewCoursePage course_name={course_name} />
      )}
    </>
  )
}
export default IfCourseExists
