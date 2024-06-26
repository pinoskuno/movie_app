import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { API_URL, API_ACCESS_TOKEN } from '@env';
import MovieList from '../components/movies/MoiveList';
import AsyncStorage from '@react-native-async-storage/async-storage' // Mengimpor AsyncStorage untuk penyimpanan lokal


const MovieDetail = ({ route, navigation }: any): JSX.Element => {
  const { id } = route.params;
  const [movie, setMovie] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState<boolean>(false)

  const fetchData = (): void => {
    if (API_URL == null || API_ACCESS_TOKEN == null) {
      throw new Error('ENV not found');
    }

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_ACCESS_TOKEN}`,
      },
    };

    fetch(`${API_URL}/movie/${id}?language=en-US`, options)
      .then((response) => response.json())
      .then((response) => {
        console.log('Movie Data:', response); // Log data movie ke konsol
        setMovie(response);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const fetchRecommendations = (): void => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_ACCESS_TOKEN}`,
      },
    };

    fetch(
      `${API_URL}/movie/${id}/recommendations?language=en-US&page=1`,
      options,
    )
      .then((response) => response.json())
      .then((response) => {
        console.log('Recommendations Data:', response.results);
        setRecommendations(response.results);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const addFavorite = async (movie: any): Promise<void> => {
    try {
      const initialData: string | null =
        await AsyncStorage.getItem('@FavoriteList')
      let favMovieList: any[] = initialData ? JSON.parse(initialData) : []

      favMovieList.push(movie) 
      await AsyncStorage.setItem('@FavoriteList', JSON.stringify(favMovieList)) 
      setIsFavorite(true) 
    } catch (error) {
      console.log(error) 
    }
  }

 
  const removeFavorite = async (id: number): Promise<void> => {
    try {
      const initialData: string | null =
        await AsyncStorage.getItem('@FavoriteList')
      if (initialData) {
        let favMovieList: any[] = JSON.parse(initialData)
        favMovieList = favMovieList.filter((movie) => movie.id !== id) 
        await AsyncStorage.setItem(
          '@FavoriteList',
          JSON.stringify(favMovieList),
        ) 
        setIsFavorite(false) 
      }
    } catch (error) {
      console.log(error) 
    }
  }
  
  const checkIsFavorite = async (id: number): Promise<void> => {
    try {
      const initialData: string | null =
        await AsyncStorage.getItem('@FavoriteList')
      if (initialData) {
        const favMovieList: any[] = JSON.parse(initialData)
        const isFav = favMovieList.some((movie) => movie.id === id) 
        setIsFavorite(isFav) 
      }
    } catch (error) {
      console.log(error) 
    }
  }


  useEffect(() => {
    fetchData();
    fetchRecommendations();
    checkIsFavorite(id)
  }, [id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {movie ? (
          <>
            <View style={styles.posterContainer}>
              <Image
                style={styles.poster}
                source={{
                  uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                }}
              />
              <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={16} color="yellow" />
                <Text style={styles.rating}>
                  {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                </Text>
                <TouchableOpacity
                style={styles.heartIcon}
                onPress={() => {
                  if (isFavorite) {
                    removeFavorite(movie.id) 
                  } else {
                    addFavorite(movie) 
                  }
                }}
              >
                <FontAwesome
                  name={isFavorite ? 'heart' : 'heart-o'} 
                  size={30}
                  color="red"
                />
              </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.overview}>{movie.overview}</Text>
            <Text style={styles.label}>Release Date:</Text>
            <Text style={styles.value}>{movie.release_date}</Text>
            <Text style={styles.label}>Rating:</Text>
            <Text style={styles.value}>{movie.vote_average}</Text>
            <Text style={styles.label}>Runtime:</Text>
            <Text style={styles.value}>{movie.runtime} minutes</Text>
            <Text style={styles.label}>Original Language:</Text>
            <Text style={styles.value}>{movie.original_language}</Text>
            <Text style={styles.label}>Popularity:</Text>
            <Text style={styles.value}>{movie.popularity}</Text>
            <Text style={styles.label}>Vote Count:</Text>
            <Text style={styles.value}>{movie.vote_count}</Text>
          </>
        ) : (
          <Text>Loading...</Text>
        )}
        <MovieList
          title="Recommendations"
          path={`movie/${id}/recommendations?language=en-US&page=1`}
          coverType="poster"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 35,
  },
  posterContainer: {
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    marginBottom: 16,
  },
  ratingContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 5,
    borderRadius: 5,
  },
  rating: {
    fontSize: 16,
    color: 'yellow',
    marginLeft: 5,
  },
  heartIcon: {
    position: 'absolute', 
    top: 10, 
    right: 10, 
    padding: 10, 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overview: {
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    marginBottom: 12,
  },
});

export default MovieDetail;
