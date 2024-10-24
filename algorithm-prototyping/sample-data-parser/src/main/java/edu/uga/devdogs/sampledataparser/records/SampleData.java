package edu.uga.devdogs.sampledataparser.records;

import java.util.List;

/**
 * Represents the sample data used in the scheduling system, containing the available courses and distances between buildings.
 *
 * @param courses   The array of courses in the sample data.
 * @param distances The distances between buildings on campus.
 */
public record SampleData(List<Course> courses,
                         Distances distances) {
}
