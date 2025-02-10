---
title: "Cmake编写示例"
tags: ["instruction"]
date: "2023-11-29"
slug: "cmake-instruct"
---

```CMake
cmake_minimum_required(VERSION 3.8)
project(Sentry_Decision)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

add_compile_options(-fPIC)  #用于编译动态库

# find dependencies
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(behaviortree_cpp REQUIRED)
find_package(OpenCV 4.8.0 REQUIRED)
find_package(Eigen3 3.3 REQUIRED)

# if(NOT ${OpenCV_FOUND})
#     find_package(OpenCV 4.8.0 REQUIRED
#         PATHS /user/local/opencv4.8.0 NO_DEFAULT_PATH)  从指定位置寻找
# endif()


include_directories("/usr/include/eigen3")
include_directories(${behaviortree_cpp_INCLUDE_DIRS}) 

#设置ROOT，当需要用到文件绝对位置时要用到
if(NOT ROOT)  
    set(ROOT ${PROJECT_SOURCE_DIR}/)
endif()
add_definitions(-DROOT="${ROOT}")

if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  # the following line skips the linter which checks for copyrights
  # comment the line when a copyright and license is added to all source files
  set(ament_cmake_copyright_FOUND TRUE)
  # the following line skips cpplint (only works in a git repo)
  # comment the line when this package is in a git repo and when
  # a copyright and license is added to all source files
  set(ament_cmake_cpplint_FOUND TRUE)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()

#用于debug
set(CMAKE_BUILD_TYPE "Debug")
set(CMAKE_CXX_FLAGS_DEBUG "$ENV{CXXFLAGS} -O0 -Wall -g -ggdb")
set(CMAKE_CXX_FLAGS_RELEASE "$ENV{CXXFLAGS} -O3 -Wall")

#用于多目录多文件编译
include_directories(${PROJECT_SOURCE_DIR}/include/node)
aux_source_directory(${PROJECT_SOURCE_DIR}/src SRC_LIST)

#添加可执行文件
add_executable(behavior_tree src/behavior_tree.cpp ${SRC_LIST})

#链接外部库
target_link_libraries(behavior_tree ${OpenCV_LIBS})
ament_target_dependencies(behavior_tree rclcpp)
ament_target_dependencies(behavior_tree behaviortree_cpp)

install(TARGETS
  behavior_tree
  DESTINATION lib/${PROJECT_NAME}
)
```

